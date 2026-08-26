package com.hades.repositories

import com.hades.models.{Resource, ResourceSkill}
import slick.jdbc.PostgresProfile.api._
import java.sql.Timestamp
import java.util.UUID
import scala.concurrent.{ExecutionContext, Future}

trait ResourceRepository {
  def save(resource: Resource): Future[Resource]
  def findById(id: String): Future[Option[Resource]]
  def listAll(): Future[Seq[Resource]]
  def saveResourceSkills(resourceId: String, skillIds: Seq[String]): Future[Unit]
  def findBySkillId(skillId: String): Future[Seq[Resource]]
}

class PostgresResourceRepository(db: Database)(implicit ec: ExecutionContext) extends ResourceRepository {
  private val fallback = new InMemoryResourceRepository()

  private class ResourceTable(tag: Tag) extends Table[Resource](tag, "resources") {
    def id = column[String]("id", O.PrimaryKey)
    def title = column[String]("title")
    def url = column[String]("url")
    def provider = column[String]("provider")
    def description = column[String]("description")
    def contentType = column[String]("content_type")
    def difficulty = column[String]("difficulty")
    def durationMinutes = column[Int]("duration_minutes")
    def qualityScore = column[Double]("quality_score")
    def createdAt = column[Timestamp]("created_at")
    def updatedAt = column[Timestamp]("updated_at")

    def * = (id, title, url, provider, description, contentType, difficulty, durationMinutes, qualityScore, createdAt, updatedAt).shaped <> (
      { case (id, title, url, provider, desc, cType, diff, dur, qScore, createdAt, updatedAt) =>
        Resource(id, title, url, provider, desc, cType, diff, dur, qScore, createdAt.toInstant, updatedAt.toInstant)
      },
      { r: Resource =>
        Some((r.id, r.title, r.url, r.provider, r.description, r.contentType, r.difficulty, r.durationMinutes, r.qualityScore, Timestamp.from(r.createdAt), Timestamp.from(r.updatedAt)))
      }
    )
  }

  private class ResourceSkillTable(tag: Tag) extends Table[ResourceSkill](tag, "resource_skills") {
    def id = column[String]("id", O.PrimaryKey)
    def resourceId = column[String]("resource_id")
    def skillId = column[String]("skill_id")

    def * = (id, resourceId, skillId).shaped <> (
      { case (id, rId, sId) => ResourceSkill(id, rId, sId) },
      { rs: ResourceSkill => Some((rs.id, rs.resourceId, rs.skillId)) }
    )
  }

  private val resources = TableQuery[ResourceTable]
  private val resourceSkills = TableQuery[ResourceSkillTable]

  override def save(resource: Resource): Future[Resource] = {
    db.run(resources.insertOrUpdate(resource)).map(_ => resource).recoverWith { case _ =>
      fallback.save(resource)
    }
  }

  override def findById(id: String): Future[Option[Resource]] = {
    db.run(resources.filter(_.id === id).result.headOption).recoverWith { case _ =>
      fallback.findById(id)
    }
  }

  override def listAll(): Future[Seq[Resource]] = {
    db.run(resources.result).recoverWith { case _ =>
      fallback.listAll()
    }
  }

  override def saveResourceSkills(resourceId: String, skillIds: Seq[String]): Future[Unit] = {
    val deleteAction = resourceSkills.filter(_.resourceId === resourceId).delete
    val items = skillIds.map(sId => ResourceSkill(UUID.randomUUID().toString, resourceId, sId))
    val insertAction = resourceSkills ++= items
    db.run(DBIO.seq(deleteAction, insertAction).transactionally).map(_ => ()).recoverWith { case _ =>
      fallback.saveResourceSkills(resourceId, skillIds)
    }
  }

  override def findBySkillId(skillId: String): Future[Seq[Resource]] = {
    val query = for {
      rs <- resourceSkills.filter(_.skillId === skillId)
      r <- resources if r.id === rs.resourceId
    } yield r
    db.run(query.result).recoverWith { case _ =>
      fallback.findBySkillId(skillId)
    }
  }
}

class InMemoryResourceRepository extends ResourceRepository {
  private val resourceStore = java.util.concurrent.ConcurrentHashMap.newKeySet[Resource]()
  private val rsStore = java.util.concurrent.ConcurrentHashMap.newKeySet[ResourceSkill]()

  override def save(resource: Resource): Future[Resource] = {
    import scala.jdk.CollectionConverters._
    resourceStore.removeIf(_.id == resource.id)
    resourceStore.add(resource)
    Future.successful(resource)
  }

  override def findById(id: String): Future[Option[Resource]] = {
    import scala.jdk.CollectionConverters._
    Future.successful(resourceStore.asScala.find(_.id == id))
  }

  override def listAll(): Future[Seq[Resource]] = {
    import scala.jdk.CollectionConverters._
    Future.successful(resourceStore.asScala.toSeq)
  }

  override def saveResourceSkills(resourceId: String, skillIds: Seq[String]): Future[Unit] = {
    import scala.jdk.CollectionConverters._
    rsStore.removeIf(_.resourceId == resourceId)
    skillIds.foreach(sId => rsStore.add(ResourceSkill(UUID.randomUUID().toString, resourceId, sId)))
    Future.successful(())
  }

  override def findBySkillId(skillId: String): Future[Seq[Resource]] = {
    import scala.jdk.CollectionConverters._
    val targetResourceIds = rsStore.asScala.filter(_.skillId == skillId).map(_.resourceId).toSet
    Future.successful(resourceStore.asScala.filter(r => targetResourceIds.contains(r.id)).toSeq)
  }
}
