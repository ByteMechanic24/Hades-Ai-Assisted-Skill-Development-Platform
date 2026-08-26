package com.hades.repositories

import com.hades.models.{ResourceProgress, SkillProgress}
import slick.jdbc.PostgresProfile.api._
import java.sql.Timestamp
import scala.concurrent.{ExecutionContext, Future}

trait ProgressRepository {
  def saveSkillProgress(sp: SkillProgress): Future[SkillProgress]
  def findSkillProgressByUser(userId: String): Future[Seq[SkillProgress]]
  def findSkillProgress(userId: String, skillId: String): Future[Option[SkillProgress]]

  def saveResourceProgress(rp: ResourceProgress): Future[ResourceProgress]
  def findResourceProgressByUser(userId: String): Future[Seq[ResourceProgress]]
  def findResourceProgress(userId: String, resourceId: String): Future[Option[ResourceProgress]]
}

class PostgresProgressRepository(db: Database)(implicit ec: ExecutionContext) extends ProgressRepository {
  private val fallback = new InMemoryProgressRepository()

  private class SkillProgressTable(tag: Tag) extends Table[SkillProgress](tag, "skill_progress") {
    def id = column[String]("id", O.PrimaryKey)
    def userId = column[String]("user_id")
    def skillId = column[String]("skill_id")
    def progress = column[Double]("progress")
    def confidence = column[Double]("confidence")
    def lastActivityAt = column[Timestamp]("last_activity_at")

    def * = (id, userId, skillId, progress, confidence, lastActivityAt).shaped <> (
      { case (id, uId, sId, p, c, lastAct) => SkillProgress(id, uId, sId, p, c, lastAct.toInstant) },
      { sp: SkillProgress => Some((sp.id, sp.userId, sp.skillId, sp.progress, sp.confidence, Timestamp.from(sp.lastActivityAt))) }
    )
  }

  private class ResourceProgressTable(tag: Tag) extends Table[ResourceProgress](tag, "resource_progress") {
    def id = column[String]("id", O.PrimaryKey)
    def userId = column[String]("user_id")
    def resourceId = column[String]("resource_id")
    def status = column[String]("status")
    def progressPercent = column[Double]("progress_percent")
    def completedAt = column[Option[Timestamp]]("completed_at")

    def * = (id, userId, resourceId, status, progressPercent, completedAt).shaped <> (
      { case (id, uId, rId, st, pPercent, compAt) =>
        ResourceProgress(id, uId, rId, st, pPercent, compAt.map(_.toInstant))
      },
      { rp: ResourceProgress =>
        Some((rp.id, rp.userId, rp.resourceId, rp.status, rp.progressPercent, rp.completedAt.map(Timestamp.from)))
      }
    )
  }

  private val skillProgresses = TableQuery[SkillProgressTable]
  private val resourceProgresses = TableQuery[ResourceProgressTable]

  override def saveSkillProgress(sp: SkillProgress): Future[SkillProgress] = {
    db.run(skillProgresses.insertOrUpdate(sp)).map(_ => sp).recoverWith { case _ =>
      fallback.saveSkillProgress(sp)
    }
  }

  override def findSkillProgressByUser(userId: String): Future[Seq[SkillProgress]] = {
    db.run(skillProgresses.filter(_.userId === userId).result).recoverWith { case _ =>
      fallback.findSkillProgressByUser(userId)
    }
  }

  override def findSkillProgress(userId: String, skillId: String): Future[Option[SkillProgress]] = {
    db.run(skillProgresses.filter(sp => sp.userId === userId && sp.skillId === skillId).result.headOption).recoverWith { case _ =>
      fallback.findSkillProgress(userId, skillId)
    }
  }

  override def saveResourceProgress(rp: ResourceProgress): Future[ResourceProgress] = {
    db.run(resourceProgresses.insertOrUpdate(rp)).map(_ => rp).recoverWith { case _ =>
      fallback.saveResourceProgress(rp)
    }
  }

  override def findResourceProgressByUser(userId: String): Future[Seq[ResourceProgress]] = {
    db.run(resourceProgresses.filter(_.userId === userId).result).recoverWith { case _ =>
      fallback.findResourceProgressByUser(userId)
    }
  }

  override def findResourceProgress(userId: String, resourceId: String): Future[Option[ResourceProgress]] = {
    db.run(resourceProgresses.filter(rp => rp.userId === userId && rp.resourceId === resourceId).result.headOption).recoverWith { case _ =>
      fallback.findResourceProgress(userId, resourceId)
    }
  }
}

class InMemoryProgressRepository extends ProgressRepository {
  private val spStore = java.util.concurrent.ConcurrentHashMap.newKeySet[SkillProgress]()
  private val rpStore = java.util.concurrent.ConcurrentHashMap.newKeySet[ResourceProgress]()

  override def saveSkillProgress(sp: SkillProgress): Future[SkillProgress] = {
    import scala.jdk.CollectionConverters._
    spStore.removeIf(item => item.userId == sp.userId && item.skillId == sp.skillId)
    spStore.add(sp)
    Future.successful(sp)
  }

  override def findSkillProgressByUser(userId: String): Future[Seq[SkillProgress]] = {
    import scala.jdk.CollectionConverters._
    Future.successful(spStore.asScala.filter(_.userId == userId).toSeq)
  }

  override def findSkillProgress(userId: String, skillId: String): Future[Option[SkillProgress]] = {
    import scala.jdk.CollectionConverters._
    Future.successful(spStore.asScala.find(sp => sp.userId == userId && sp.skillId == skillId))
  }

  override def saveResourceProgress(rp: ResourceProgress): Future[ResourceProgress] = {
    import scala.jdk.CollectionConverters._
    rpStore.removeIf(item => item.userId == rp.userId && item.resourceId == rp.resourceId)
    rpStore.add(rp)
    Future.successful(rp)
  }

  override def findResourceProgressByUser(userId: String): Future[Seq[ResourceProgress]] = {
    import scala.jdk.CollectionConverters._
    Future.successful(rpStore.asScala.filter(_.userId == userId).toSeq)
  }

  override def findResourceProgress(userId: String, resourceId: String): Future[Option[ResourceProgress]] = {
    import scala.jdk.CollectionConverters._
    Future.successful(rpStore.asScala.find(rp => rp.userId == userId && rp.resourceId == rp.resourceId))
  }
}
