package com.hades.repositories

import com.hades.models.LearningGoal
import slick.jdbc.PostgresProfile.api._
import java.sql.Timestamp
import scala.concurrent.{ExecutionContext, Future}

trait LearningGoalRepository {
  def save(goal: LearningGoal): Future[LearningGoal]
  def findActiveByUserId(userId: String): Future[Option[LearningGoal]]
  def findByUserId(userId: String): Future[Seq[LearningGoal]]
}

class PostgresLearningGoalRepository(db: Database)(implicit ec: ExecutionContext) extends LearningGoalRepository {
  private val fallback = new InMemoryLearningGoalRepository()

  private class LearningGoalTable(tag: Tag) extends Table[LearningGoal](tag, "learning_goals") {
    def id = column[String]("id", O.PrimaryKey)
    def userId = column[String]("user_id")
    def title = column[String]("title")
    def description = column[String]("description")
    def isActive = column[Boolean]("is_active")
    def createdAt = column[Timestamp]("created_at")
    def updatedAt = column[Timestamp]("updated_at")

    def * = (id, userId, title, description, isActive, createdAt, updatedAt).shaped <> (
      { case (id, userId, title, description, isActive, createdAt, updatedAt) =>
        LearningGoal(id, userId, title, description, isActive, createdAt.toInstant, updatedAt.toInstant)
      },
      { g: LearningGoal =>
        Some((g.id, g.userId, g.title, g.description, g.isActive, Timestamp.from(g.createdAt), Timestamp.from(g.updatedAt)))
      }
    )
  }

  private val goals = TableQuery[LearningGoalTable]

  override def save(goal: LearningGoal): Future[LearningGoal] = {
    val action = goals.insertOrUpdate(goal)
    db.run(action).map(_ => goal).recoverWith { case _ =>
      fallback.save(goal)
    }
  }

  override def findActiveByUserId(userId: String): Future[Option[LearningGoal]] = {
    db.run(goals.filter(g => g.userId === userId && g.isActive).result.headOption).recoverWith { case _ =>
      fallback.findActiveByUserId(userId)
    }
  }

  override def findByUserId(userId: String): Future[Seq[LearningGoal]] = {
    db.run(goals.filter(_.userId === userId).result).recoverWith { case _ =>
      fallback.findByUserId(userId)
    }
  }
}

class InMemoryLearningGoalRepository extends LearningGoalRepository {
  private val store = java.util.concurrent.ConcurrentHashMap.newKeySet[LearningGoal]()

  override def save(goal: LearningGoal): Future[LearningGoal] = {
    import scala.jdk.CollectionConverters._
    store.removeIf(_.id == goal.id)
    store.add(goal)
    Future.successful(goal)
  }

  override def findActiveByUserId(userId: String): Future[Option[LearningGoal]] = {
    import scala.jdk.CollectionConverters._
    Future.successful(store.asScala.find(g => g.userId == userId && g.isActive))
  }

  override def findByUserId(userId: String): Future[Seq[LearningGoal]] = {
    import scala.jdk.CollectionConverters._
    Future.successful(store.asScala.filter(_.userId == userId).toSeq)
  }
}
