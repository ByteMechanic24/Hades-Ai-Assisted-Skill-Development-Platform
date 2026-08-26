package com.hades.services

import com.hades.clients.AiServiceClient
import com.hades.models.{LearningPath, LearningPathNode, Milestone}
import com.hades.repositories._
import com.hades.schemas._
import com.hades.validation.AiResponseValidator
import java.util.UUID
import scala.concurrent.{ExecutionContext, Future}

trait LearningPathService {
  def generateLearningPath(request: LearningPathRequest): Future[LearningPathResponse]
  def generateLearningPathForUser(userId: String): Future[LearningPathResponse]
  def getUserLearningPath(userId: String): Future[Option[LearningPathResponse]]
  def getLearningPathById(id: String): Future[Option[LearningPathResponse]]
}

class LearningPathServiceImpl(
  aiServiceClient: AiServiceClient,
  dashboardService: DashboardService = null,
  learningPathRepository: LearningPathRepository = null,
  skillRepository: SkillRepository = null
)(implicit ec: ExecutionContext) extends LearningPathService {

  override def generateLearningPath(request: LearningPathRequest): Future[LearningPathResponse] = {
    aiServiceClient.generateLearningPath(request).flatMap { response =>
      AiResponseValidator.validate(response) match {
        case Left(valErr) => Future.failed(valErr)
        case Right(validResponse) => Future.successful(validResponse)
      }
    }
  }

  override def generateLearningPathForUser(userId: String): Future[LearningPathResponse] = {
    if (dashboardService == null || learningPathRepository == null) {
      Future.failed(new IllegalStateException("DashboardService and LearningPathRepository are required for user path generation."))
    } else {
      dashboardService.getLearnerState(userId).flatMap { state =>
        val p = state.profile.getOrElse(com.hades.models.LearnerProfile(userId = userId))
        val targetRole = if (p.targetRole.nonEmpty) p.targetRole else "Machine Learning Engineer"
        val activeGoalTitle = state.activeGoal.map(_.title).getOrElse("Learn Core Fundamentals")
        val activeGoalDesc = state.activeGoal.map(_.description).getOrElse("Build strong foundational knowledge.")

        val learnerContext = LearnerContext(
          experienceLevel = p.experienceLevel,
          interests = if (state.interests.nonEmpty) state.interests.map(_.name) else Seq("Artificial Intelligence", "Python"),
          career = CareerContext(targetRole = targetRole),
          learningPreferences = p.learningPreferences,
          availability = LearningAvailability(minutesPerDay = p.minutesPerDay, daysPerWeek = p.daysPerWeek),
          existingSkills = state.skillProgresses.map(sp => SkillConfidence(sp.skillId, sp.confidence)),
          completedLearning = state.resourceProgresses.filter(_.status == "completed").map(rp => CompletedLearning(rp.resourceId, "course")),
          riasec = state.riasec.map(r => RiasecProfile(r.realistic, r.investigative, r.artistic, r.social, r.enterprising, r.conventional))
        )

        val req = LearningPathRequest(learnerContext, LearningGoalRequest(activeGoalTitle, activeGoalDesc))

        aiServiceClient.generateLearningPath(req).flatMap { response =>
          AiResponseValidator.validate(response) match {
            case Left(valErr) => Future.failed(valErr)
            case Right(validResp) =>
              val pathId = UUID.randomUUID().toString
              val lp = LearningPath(
                id = pathId,
                userId = userId,
                goalId = state.activeGoal.map(_.id).getOrElse(""),
                title = validResp.title,
                description = validResp.description,
                estimatedHours = validResp.estimatedHours,
                status = "active"
              )

              val nodes = validResp.nodes.zipWithIndex.map { case (n, idx) =>
                LearningPathNode(
                  id = UUID.randomUUID().toString,
                  learningPathId = pathId,
                  nodeId = n.id,
                  title = n.title,
                  description = n.description,
                  estimatedHours = n.estimatedHours,
                  sequence = n.sequence,
                  status = if (idx == 0) "in_progress" else "locked",
                  skillIds = n.skillIds,
                  prerequisiteIds = n.prerequisiteIds
                )
              }

              val milestones = validResp.milestones.map { m =>
                Milestone(
                  id = UUID.randomUUID().toString,
                  learningPathId = pathId,
                  title = m.title,
                  requiredNodeIds = m.nodeIds,
                  requiredScore = 70.0
                )
              }

              learningPathRepository.saveTransactional(lp, nodes, milestones).map(_ => validResp)
          }
        }
      }
    }
  }

  override def getUserLearningPath(userId: String): Future[Option[LearningPathResponse]] = {
    if (learningPathRepository == null) Future.successful(None)
    else {
      learningPathRepository.findActiveByUserId(userId).flatMap {
        case None => Future.successful(None)
        case Some(lp) =>
          learningPathRepository.findNodesByPathId(lp.id).map { nodes =>
            val nodeResps = nodes.map { n =>
              LearningPathNodeResponse(n.nodeId, n.title, n.description, n.skillIds, n.prerequisiteIds, n.estimatedHours, n.sequence)
            }
            Some(LearningPathResponse(lp.title, lp.description, lp.estimatedHours, Nil, nodeResps, Nil))
          }
      }
    }
  }

  override def getLearningPathById(id: String): Future[Option[LearningPathResponse]] = {
    if (learningPathRepository == null) Future.successful(None)
    else {
      learningPathRepository.findById(id).flatMap {
        case None => Future.successful(None)
        case Some(lp) =>
          learningPathRepository.findNodesByPathId(lp.id).map { nodes =>
            val nodeResps = nodes.map { n =>
              LearningPathNodeResponse(n.nodeId, n.title, n.description, n.skillIds, n.prerequisiteIds, n.estimatedHours, n.sequence)
            }
            Some(LearningPathResponse(lp.title, lp.description, lp.estimatedHours, Nil, nodeResps, Nil))
          }
      }
    }
  }
}
