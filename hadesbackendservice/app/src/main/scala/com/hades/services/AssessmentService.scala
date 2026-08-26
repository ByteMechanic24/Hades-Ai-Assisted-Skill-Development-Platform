package com.hades.services

import com.hades.models.{Assessment, AssessmentQuestion, AssessmentResult, SkillProgress}
import com.hades.repositories.{AssessmentRepository, ProgressRepository}
import com.hades.schemas.{AssessmentSubmitRequest, AssessmentSubmitResponse}
import java.time.Instant
import java.util.UUID
import scala.concurrent.{ExecutionContext, Future}

trait AssessmentService {
  def getAssessment(id: String): Future[Option[(Assessment, Seq[AssessmentQuestion])]]
  def submitAssessment(userId: String, assessmentId: String, req: AssessmentSubmitRequest): Future[AssessmentSubmitResponse]
}

class AssessmentServiceImpl(
  assessmentRepo: AssessmentRepository,
  progressRepo: ProgressRepository
)(implicit ec: ExecutionContext) extends AssessmentService {

  override def getAssessment(id: String): Future[Option[(Assessment, Seq[AssessmentQuestion])]] = {
    assessmentRepo.findById(id).flatMap {
      case Some(assessment) =>
        assessmentRepo.findQuestionsByAssessmentId(id).map(qs => Some((assessment, qs)))
      case None =>
        Future.successful(None)
    }
  }

  override def submitAssessment(
    userId: String,
    assessmentId: String,
    req: AssessmentSubmitRequest
  ): Future[AssessmentSubmitResponse] = {
    assessmentRepo.findById(assessmentId).flatMap {
      case None =>
        Future.failed(new IllegalArgumentException(s"Assessment with ID $assessmentId not found."))

      case Some(assessment) =>
        assessmentRepo.findQuestionsByAssessmentId(assessmentId).flatMap { questions =>
          val totalQuestions = questions.size
          val correctCount = questions.count { q =>
            req.answers.get(q.id).contains(q.correctOptionIndex)
          }

          val score = if (totalQuestions > 0) (correctCount.toDouble / totalQuestions) * 100.0 else 0.0
          val passed = score >= assessment.passingScore

          val result = AssessmentResult(
            id = UUID.randomUUID().toString,
            userId = userId,
            assessmentId = assessmentId,
            score = score,
            passed = passed
          )

          // Deterministic update of skill confidence
          val confidenceImpact = score / 100.0
          val spFut = progressRepo.findSkillProgress(userId, assessment.skillId).flatMap { existingOpt =>
            val newConf = existingOpt.map(sp => (sp.confidence + confidenceImpact) / 2.0).getOrElse(confidenceImpact)
            val sp = SkillProgress(
              id = existingOpt.map(_.id).getOrElse(UUID.randomUUID().toString),
              userId = userId,
              skillId = assessment.skillId,
              progress = if (passed) 1.0 else 0.5,
              confidence = math.min(1.0, math.max(0.0, newConf)),
              lastActivityAt = Instant.now()
            )
            progressRepo.saveSkillProgress(sp)
          }

          for {
            _ <- assessmentRepo.saveResult(result)
            _ <- spFut
          } yield AssessmentSubmitResponse(score, passed, assessment.passingScore)
        }
    }
  }
}
