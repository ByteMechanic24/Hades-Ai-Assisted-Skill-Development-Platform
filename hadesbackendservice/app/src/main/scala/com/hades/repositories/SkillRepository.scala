package com.hades.repositories

import com.hades.models.{Skill, SkillPrerequisite}
import slick.jdbc.PostgresProfile.api._
import java.sql.Timestamp
import java.util.UUID
import scala.concurrent.{ExecutionContext, Future}

trait SkillRepository {
  def save(skill: Skill): Future[Skill]
  def findById(id: String): Future[Option[Skill]]
  def findByName(name: String): Future[Option[Skill]]
  def listAll(): Future[Seq[Skill]]
  def savePrerequisites(skillId: String, prereqSkillIds: Seq[String]): Future[Unit]
  def findPrerequisites(skillId: String): Future[Seq[Skill]]
}

class PostgresSkillRepository(db: Database)(implicit ec: ExecutionContext) extends SkillRepository {

  private class SkillTable(tag: Tag) extends Table[Skill](tag, "skills") {
    def id = column[String]("id", O.PrimaryKey)
    def name = column[String]("name")
    def difficulty = column[String]("difficulty")
    def category = column[String]("category")
    def createdAt = column[Timestamp]("created_at")
    def updatedAt = column[Timestamp]("updated_at")

    def * = (id, name, difficulty, category, createdAt, updatedAt).shaped <> (
      { case (id, name, diff, cat, createdAt, updatedAt) =>
        Skill(id, name, diff, cat, createdAt.toInstant, updatedAt.toInstant)
      },
      { s: Skill =>
        Some((s.id, s.name, s.difficulty, s.category, Timestamp.from(s.createdAt), Timestamp.from(s.updatedAt)))
      }
    )
  }

  private class PrerequisiteTable(tag: Tag) extends Table[SkillPrerequisite](tag, "skill_prerequisites") {
    def id = column[String]("id", O.PrimaryKey)
    def skillId = column[String]("skill_id")
    def prerequisiteSkillId = column[String]("prerequisite_skill_id")
    def createdAt = column[Timestamp]("created_at")

    def * = (id, skillId, prerequisiteSkillId, createdAt).shaped <> (
      { case (id, sId, pId, createdAt) => SkillPrerequisite(id, sId, pId, createdAt.toInstant) },
      { p: SkillPrerequisite => Some((p.id, p.skillId, p.prerequisiteSkillId, Timestamp.from(p.createdAt))) }
    )
  }

  private val skills = TableQuery[SkillTable]
  private val prereqs = TableQuery[PrerequisiteTable]

  override def save(skill: Skill): Future[Skill] = {
    db.run(skills.insertOrUpdate(skill)).map(_ => skill)
  }

  override def findById(id: String): Future[Option[Skill]] = {
    db.run(skills.filter(_.id === id).result.headOption)
  }

  override def findByName(name: String): Future[Option[Skill]] = {
    db.run(skills.filter(_.name === name).result.headOption)
  }

  override def listAll(): Future[Seq[Skill]] = {
    db.run(skills.result)
  }

  override def savePrerequisites(skillId: String, prereqSkillIds: Seq[String]): Future[Unit] = {
    val deleteAction = prereqs.filter(_.skillId === skillId).delete
    val items = prereqSkillIds.map(pId => SkillPrerequisite(UUID.randomUUID().toString, skillId, pId))
    val insertAction = prereqs ++= items
    db.run(DBIO.seq(deleteAction, insertAction).transactionally).map(_ => ())
  }

  override def findPrerequisites(skillId: String): Future[Seq[Skill]] = {
    val query = for {
      p <- prereqs.filter(_.skillId === skillId)
      s <- skills if s.id === p.prerequisiteSkillId
    } yield s
    db.run(query.result)
  }
}

class InMemorySkillRepository extends SkillRepository {
  private val skillStore = java.util.concurrent.ConcurrentHashMap.newKeySet[Skill]()
  private val prereqStore = java.util.concurrent.ConcurrentHashMap.newKeySet[SkillPrerequisite]()

  override def save(skill: Skill): Future[Skill] = {
    import scala.jdk.CollectionConverters._
    skillStore.removeIf(_.id == skill.id)
    skillStore.add(skill)
    Future.successful(skill)
  }

  override def findById(id: String): Future[Option[Skill]] = {
    import scala.jdk.CollectionConverters._
    Future.successful(skillStore.asScala.find(_.id == id))
  }

  override def findByName(name: String): Future[Option[Skill]] = {
    import scala.jdk.CollectionConverters._
    Future.successful(skillStore.asScala.find(_.name.equalsIgnoreCase(name)))
  }

  override def listAll(): Future[Seq[Skill]] = {
    import scala.jdk.CollectionConverters._
    Future.successful(skillStore.asScala.toSeq)
  }

  override def savePrerequisites(skillId: String, prereqSkillIds: Seq[String]): Future[Unit] = {
    import scala.jdk.CollectionConverters._
    prereqStore.removeIf(_.skillId == skillId)
    prereqSkillIds.foreach { pId =>
      prereqStore.add(SkillPrerequisite(UUID.randomUUID().toString, skillId, pId))
    }
    Future.successful(())
  }

  override def findPrerequisites(skillId: String): Future[Seq[Skill]] = {
    import scala.jdk.CollectionConverters._
    val targetIds = prereqStore.asScala.filter(_.skillId == skillId).map(_.prerequisiteSkillId).toSet
    Future.successful(skillStore.asScala.filter(s => targetIds.contains(s.id)).toSeq)
  }
}
