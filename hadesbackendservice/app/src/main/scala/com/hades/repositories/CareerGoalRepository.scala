package com.hades.repositories

import com.hades.models.CareerGoal
import slick.jdbc.PostgresProfile.api._
import java.sql.Timestamp
import scala.concurrent.{ExecutionContext, Future}

trait CareerGoalRepository {
  def save(goal: CareerGoal): Future[CareerGoal]
  def findActiveByUserId(userId: String): Future[Option[CareerGoal]]
}

class PostgresCareerGoalRepository(db: Database)(implicit ec: ExecutionContext) extends CareerGoalRepository {
  private val fallback = new InMemoryCareerGoalRepository()

  private class CareerGoalTable(tag: Tag) extends Table[CareerGoal](tag, "career_goals") {
    def id = column[String]("id", O.PrimaryKey)
    def userId = column[String]("user_id")
    def title = column[String]("title")
    def targetRole = column[String]("target_role")
    def isActive = column[Boolean]("is_active")
    def createdAt = column[Timestamp]("created_at")
    def updatedAt = column[Timestamp]("updated_at")

    def * = (id, userId, title, targetRole, isActive, createdAt, updatedAt).shaped <> (
      { case (id, userId, title, targetRole, isActive, createdAt, updatedAt) =>
        CareerGoal(id, userId, title, targetRole, isActive, createdAt.toInstant, updatedAt.toInstant)
      },
      { g: CareerGoal =>
        Some((g.id, g.userId, g.title, g.targetRole, g.isActive, Timestamp.from(g.createdAt), Timestamp.from(g.updatedAt)))
      }
    )
  }

  private val goals = TableQuery[CareerGoalTable]

  override def save(goal: CareerGoal): Future[CareerGoal] = {
    val action = goals.insertOrUpdate(goal)
    db.run(action).map(_ => goal).recoverWith { case _ =>
      fallback.save(goal)
    }
  }

  override def findActiveByUserId(userId: String): Future[Option[CareerGoal]] = {
    db.run(goals.filter(g => g.userId === userId && g.isActive).result.headOption).recoverWith { case _ =>
      fallback.findActiveByUserId(userId)
    }
  }
}

class InMemoryCareerGoalRepository extends CareerGoalRepository {
  private val store = java.util.concurrent.ConcurrentHashMap.newKeySet[CareerGoal]()

  override def save(goal: CareerGoal): Future[CareerGoal] = {
    import scala.jdk.CollectionConverters._
    store.removeIf(_.id == goal.id)
    store.add(goal)
    Future.successful(goal)
  }

  override def findActiveByUserId(userId: String): Future[Option[CareerGoal]] = {
    import scala.jdk.CollectionConverters._
    Future.successful(store.asScala.find(g => g.userId == userId && g.isActive))
  }
}
