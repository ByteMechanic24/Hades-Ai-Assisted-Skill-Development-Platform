package com.hades.repositories

import com.hades.models.LearnerProfile
import slick.jdbc.PostgresProfile.api._
import java.sql.Timestamp
import scala.concurrent.{ExecutionContext, Future}

trait LearnerProfileRepository {
  def save(profile: LearnerProfile): Future[LearnerProfile]
  def findByUserId(userId: String): Future[Option[LearnerProfile]]
}

class PostgresLearnerProfileRepository(db: Database)(implicit ec: ExecutionContext) extends LearnerProfileRepository {
  private val fallback = new InMemoryLearnerProfileRepository()

  private class LearnerProfileTable(tag: Tag) extends Table[LearnerProfile](tag, "learner_profiles") {
    def userId = column[String]("user_id", O.PrimaryKey)
    def experienceLevel = column[String]("experience_level")
    def minutesPerDay = column[Int]("minutes_per_day")
    def daysPerWeek = column[Int]("days_per_week")
    def targetRole = column[String]("target_role")
    def learningPreferences = column[String]("learning_preferences")
    def createdAt = column[Timestamp]("created_at")
    def updatedAt = column[Timestamp]("updated_at")

    def * = (userId, experienceLevel, minutesPerDay, daysPerWeek, targetRole, learningPreferences, createdAt, updatedAt).shaped <> (
      { case (userId, experienceLevel, minutesPerDay, daysPerWeek, targetRole, learningPrefsStr, createdAt, updatedAt) =>
        LearnerProfile(
          userId = userId,
          experienceLevel = experienceLevel,
          minutesPerDay = minutesPerDay,
          daysPerWeek = daysPerWeek,
          targetRole = targetRole,
          learningPreferences = if (learningPrefsStr.trim.isEmpty) Nil else learningPrefsStr.split(",").toSeq,
          createdAt = createdAt.toInstant,
          updatedAt = updatedAt.toInstant
        )
      },
      { p: LearnerProfile =>
        Some((
          p.userId,
          p.experienceLevel,
          p.minutesPerDay,
          p.daysPerWeek,
          p.targetRole,
          p.learningPreferences.mkString(","),
          Timestamp.from(p.createdAt),
          Timestamp.from(p.updatedAt)
        ))
      }
    )
  }

  private val profiles = TableQuery[LearnerProfileTable]

  override def save(profile: LearnerProfile): Future[LearnerProfile] = {
    val hoursPerWeek = (profile.minutesPerDay * profile.daysPerWeek) / 60
    val upsertLearnerAction = sqlu"""
      INSERT INTO learners (id, external_id, experience_level, available_hours_per_week)
      VALUES (gen_random_uuid(), ${profile.userId}, ${profile.experienceLevel}, $hoursPerWeek)
      ON CONFLICT (external_id) DO UPDATE
      SET experience_level = EXCLUDED.experience_level,
          available_hours_per_week = EXCLUDED.available_hours_per_week
    """.asTry

    val action = for {
      _ <- upsertLearnerAction
      _ <- profiles.insertOrUpdate(profile)
    } yield profile

    db.run(action).map(_ => profile).recoverWith { case _ =>
      fallback.save(profile)
    }
  }

  override def findByUserId(userId: String): Future[Option[LearnerProfile]] = {
    db.run(profiles.filter(_.userId === userId).result.headOption).recoverWith { case _ =>
      fallback.findByUserId(userId)
    }
  }
}

class InMemoryLearnerProfileRepository extends LearnerProfileRepository {
  private val store = java.util.concurrent.ConcurrentHashMap.newKeySet[LearnerProfile]()

  override def save(profile: LearnerProfile): Future[LearnerProfile] = {
    import scala.jdk.CollectionConverters._
    store.removeIf(_.userId == profile.userId)
    store.add(profile)
    Future.successful(profile)
  }

  override def findByUserId(userId: String): Future[Option[LearnerProfile]] = {
    import scala.jdk.CollectionConverters._
    Future.successful(store.asScala.find(_.userId == userId))
  }
}
