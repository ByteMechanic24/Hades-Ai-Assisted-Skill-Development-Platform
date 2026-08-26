package com.hades.repositories

import com.hades.models.{Milestone, UserMilestone}
import slick.jdbc.PostgresProfile.api._
import java.sql.Timestamp
import scala.concurrent.{ExecutionContext, Future}

trait MilestoneRepository {
  def findByPathId(pathId: String): Future[Seq[Milestone]]
  def findById(id: String): Future[Option[Milestone]]
  def saveMilestones(items: Seq[Milestone]): Future[Unit]
  def saveUserMilestone(um: UserMilestone): Future[UserMilestone]
  def findUserMilestones(userId: String): Future[Seq[UserMilestone]]
}

class PostgresMilestoneRepository(db: Database)(implicit ec: ExecutionContext) extends MilestoneRepository {
  private val fallback = new InMemoryMilestoneRepository()

  private class MilestoneTable(tag: Tag) extends Table[Milestone](tag, "milestones") {
    def id = column[String]("id", O.PrimaryKey)
    def learningPathId = column[String]("learning_path_id")
    def title = column[String]("title")
    def requiredNodeIds = column[String]("required_node_ids")
    def requiredScore = column[Double]("required_score")

    def * = (id, learningPathId, title, requiredNodeIds, requiredScore).shaped <> (
      { case (id, pathId, title, rNodeIds, rScore) =>
        Milestone(id, pathId, title, if (rNodeIds.trim.isEmpty) Nil else rNodeIds.split(",").toSeq, rScore)
      },
      { m: Milestone =>
        Some((m.id, m.learningPathId, m.title, m.requiredNodeIds.mkString(","), m.requiredScore))
      }
    )
  }

  private class UserMilestoneTable(tag: Tag) extends Table[UserMilestone](tag, "user_milestones") {
    def id = column[String]("id", O.PrimaryKey)
    def userId = column[String]("user_id")
    def milestoneId = column[String]("milestone_id")
    def status = column[String]("status")
    def completedAt = column[Option[Timestamp]]("completed_at")

    def * = (id, userId, milestoneId, status, completedAt).shaped <> (
      { case (id, uId, mId, st, compAt) =>
        UserMilestone(id, uId, mId, st, compAt.map(_.toInstant))
      },
      { um: UserMilestone =>
        Some((um.id, um.userId, um.milestoneId, um.status, um.completedAt.map(Timestamp.from)))
      }
    )
  }

  private val milestones = TableQuery[MilestoneTable]
  private val userMilestones = TableQuery[UserMilestoneTable]

  override def findByPathId(pathId: String): Future[Seq[Milestone]] = {
    db.run(milestones.filter(_.learningPathId === pathId).result).recoverWith { case _ =>
      fallback.findByPathId(pathId)
    }
  }

  override def findById(id: String): Future[Option[Milestone]] = {
    db.run(milestones.filter(_.id === id).result.headOption).recoverWith { case _ =>
      fallback.findById(id)
    }
  }

  override def saveMilestones(items: Seq[Milestone]): Future[Unit] = {
    val action = DBIO.seq(items.map(m => milestones.insertOrUpdate(m)): _*)
    db.run(action.transactionally).map(_ => ()).recoverWith { case _ =>
      fallback.saveMilestones(items)
    }
  }

  override def saveUserMilestone(um: UserMilestone): Future[UserMilestone] = {
    db.run(userMilestones.insertOrUpdate(um)).map(_ => um).recoverWith { case _ =>
      fallback.saveUserMilestone(um)
    }
  }

  override def findUserMilestones(userId: String): Future[Seq[UserMilestone]] = {
    db.run(userMilestones.filter(_.userId === userId).result).recoverWith { case _ =>
      fallback.findUserMilestones(userId)
    }
  }
}

class InMemoryMilestoneRepository extends MilestoneRepository {
  private val mStore = java.util.concurrent.ConcurrentHashMap.newKeySet[Milestone]()
  private val umStore = java.util.concurrent.ConcurrentHashMap.newKeySet[UserMilestone]()

  override def findByPathId(pathId: String): Future[Seq[Milestone]] = {
    import scala.jdk.CollectionConverters._
    Future.successful(mStore.asScala.filter(_.learningPathId == pathId).toSeq)
  }

  override def findById(id: String): Future[Option[Milestone]] = {
    import scala.jdk.CollectionConverters._
    Future.successful(mStore.asScala.find(_.id == id))
  }

  override def saveMilestones(items: Seq[Milestone]): Future[Unit] = {
    import scala.jdk.CollectionConverters._
    items.foreach { item =>
      mStore.removeIf(_.id == item.id)
      mStore.add(item)
    }
    Future.successful(())
  }

  override def saveUserMilestone(um: UserMilestone): Future[UserMilestone] = {
    import scala.jdk.CollectionConverters._
    umStore.removeIf(item => item.userId == um.userId && item.milestoneId == um.milestoneId)
    umStore.add(um)
    Future.successful(um)
  }

  override def findUserMilestones(userId: String): Future[Seq[UserMilestone]] = {
    import scala.jdk.CollectionConverters._
    Future.successful(umStore.asScala.filter(_.userId == userId).toSeq)
  }
}
