package com.hades.repositories

import com.hades.models.{Assessment, AssessmentQuestion, AssessmentResult}
import slick.jdbc.PostgresProfile.api._
import java.sql.Timestamp
import scala.concurrent.{ExecutionContext, Future}

trait AssessmentRepository {
  def saveAssessment(assessment: Assessment, questions: Seq[AssessmentQuestion]): Future[Assessment]
  def findById(id: String): Future[Option[Assessment]]
  def findQuestionsByAssessmentId(assessmentId: String): Future[Seq[AssessmentQuestion]]
  def saveResult(result: AssessmentResult): Future[AssessmentResult]
  def findResultsByUser(userId: String): Future[Seq[AssessmentResult]]
}

class PostgresAssessmentRepository(db: Database)(implicit ec: ExecutionContext) extends AssessmentRepository {

  private class AssessmentTable(tag: Tag) extends Table[Assessment](tag, "assessments") {
    def id = column[String]("id", O.PrimaryKey)
    def title = column[String]("title")
    def skillId = column[String]("skill_id")
    def passingScore = column[Int]("passing_score")
    def createdAt = column[Timestamp]("created_at")
    def updatedAt = column[Timestamp]("updated_at")

    def * = (id, title, skillId, passingScore, createdAt, updatedAt).shaped <> (
      { case (id, title, sId, passScore, createdAt, updatedAt) =>
        Assessment(id, title, sId, passScore, createdAt.toInstant, updatedAt.toInstant)
      },
      { a: Assessment =>
        Some((a.id, a.title, a.skillId, a.passingScore, Timestamp.from(a.createdAt), Timestamp.from(a.updatedAt)))
      }
    )
  }

  private class QuestionTable(tag: Tag) extends Table[AssessmentQuestion](tag, "assessment_questions") {
    def id = column[String]("id", O.PrimaryKey)
    def assessmentId = column[String]("assessment_id")
    def questionText = column[String]("question_text")
    def options = column[String]("options")
    def correctOptionIndex = column[Int]("correct_option_index")
    def explanation = column[String]("explanation")

    def * = (id, assessmentId, questionText, options, correctOptionIndex, explanation).shaped <> (
      { case (id, aId, text, opts, idx, exp) =>
        AssessmentQuestion(id, aId, text, if (opts.trim.isEmpty) Nil else opts.split(";;").toSeq, idx, exp)
      },
      { q: AssessmentQuestion =>
        Some((q.id, q.assessmentId, q.questionText, q.options.mkString(";;"), q.correctOptionIndex, q.explanation))
      }
    )
  }

  private class ResultTable(tag: Tag) extends Table[AssessmentResult](tag, "assessment_results") {
    def id = column[String]("id", O.PrimaryKey)
    def userId = column[String]("user_id")
    def assessmentId = column[String]("assessment_id")
    def score = column[Double]("score")
    def passed = column[Boolean]("passed")
    def completedAt = column[Timestamp]("completed_at")

    def * = (id, userId, assessmentId, score, passed, completedAt).shaped <> (
      { case (id, uId, aId, score, passed, compAt) =>
        AssessmentResult(id, uId, aId, score, passed, compAt.toInstant)
      },
      { r: AssessmentResult =>
        Some((r.id, r.userId, r.assessmentId, r.score, r.passed, Timestamp.from(r.completedAt)))
      }
    )
  }

  private val assessments = TableQuery[AssessmentTable]
  private val questions = TableQuery[QuestionTable]
  private val results = TableQuery[ResultTable]

  override def saveAssessment(assessment: Assessment, qList: Seq[AssessmentQuestion]): Future[Assessment] = {
    val action = (for {
      _ <- assessments.insertOrUpdate(assessment)
      _ <- questions.filter(_.assessmentId === assessment.id).delete
      _ <- questions ++= qList
    } yield assessment).transactionally
    db.run(action)
  }

  override def findById(id: String): Future[Option[Assessment]] = {
    db.run(assessments.filter(_.id === id).result.headOption)
  }

  override def findQuestionsByAssessmentId(assessmentId: String): Future[Seq[AssessmentQuestion]] = {
    db.run(questions.filter(_.assessmentId === assessmentId).result)
  }

  override def saveResult(result: AssessmentResult): Future[AssessmentResult] = {
    db.run(results.insertOrUpdate(result)).map(_ => result)
  }

  override def findResultsByUser(userId: String): Future[Seq[AssessmentResult]] = {
    db.run(results.filter(_.userId === userId).result)
  }
}

class InMemoryAssessmentRepository extends AssessmentRepository {
  private val assessmentStore = java.util.concurrent.ConcurrentHashMap.newKeySet[Assessment]()
  private val questionStore = java.util.concurrent.ConcurrentHashMap.newKeySet[AssessmentQuestion]()
  private val resultStore = java.util.concurrent.ConcurrentHashMap.newKeySet[AssessmentResult]()

  override def saveAssessment(assessment: Assessment, qList: Seq[AssessmentQuestion]): Future[Assessment] = {
    import scala.jdk.CollectionConverters._
    assessmentStore.removeIf(_.id == assessment.id)
    assessmentStore.add(assessment)
    questionStore.removeIf(_.assessmentId == assessment.id)
    qList.foreach(questionStore.add)
    Future.successful(assessment)
  }

  override def findById(id: String): Future[Option[Assessment]] = {
    import scala.jdk.CollectionConverters._
    Future.successful(assessmentStore.asScala.find(_.id == id))
  }

  override def findQuestionsByAssessmentId(assessmentId: String): Future[Seq[AssessmentQuestion]] = {
    import scala.jdk.CollectionConverters._
    Future.successful(questionStore.asScala.filter(_.assessmentId == assessmentId).toSeq)
  }

  override def saveResult(result: AssessmentResult): Future[AssessmentResult] = {
    import scala.jdk.CollectionConverters._
    resultStore.removeIf(_.id == result.id)
    resultStore.add(result)
    Future.successful(result)
  }

  override def findResultsByUser(userId: String): Future[Seq[AssessmentResult]] = {
    import scala.jdk.CollectionConverters._
    Future.successful(resultStore.asScala.filter(_.userId == userId).toSeq)
  }
}
