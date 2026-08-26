package com.hades.repositories

import com.hades.models.ProgressEvent
import slick.jdbc.PostgresProfile.api._
import java.sql.Timestamp
import scala.concurrent.{ExecutionContext, Future}

trait EventRepository {
  def save(event: ProgressEvent): Future[ProgressEvent]
  def findByUserId(userId: String, limit: Int = 50): Future[Seq[ProgressEvent]]
}

class PostgresEventRepository(db: Database)(implicit ec: ExecutionContext) extends EventRepository {
  private val fallback = new InMemoryEventRepository()

  private class ProgressEventTable(tag: Tag) extends Table[ProgressEvent](tag, "progress_events") {
    def id = column[String]("id", O.PrimaryKey)
    def userId = column[String]("user_id")
    def eventType = column[String]("event_type")
    def entityId = column[String]("entity_id")
    def payload = column[String]("payload")
    def createdAt = column[Timestamp]("created_at")

    def * = (id, userId, eventType, entityId, payload, createdAt).shaped <> (
      { case (id, uId, eType, eId, p, createdAt) =>
        ProgressEvent(id, uId, eType, eId, p, createdAt.toInstant)
      },
      { pe: ProgressEvent =>
        Some((pe.id, pe.userId, pe.eventType, pe.entityId, pe.payload, Timestamp.from(pe.createdAt)))
      }
    )
  }

  private val events = TableQuery[ProgressEventTable]

  override def save(event: ProgressEvent): Future[ProgressEvent] = {
    db.run(events.insertOrUpdate(event)).map(_ => event).recoverWith { case _ =>
      fallback.save(event)
    }
  }

  override def findByUserId(userId: String, limit: Int = 50): Future[Seq[ProgressEvent]] = {
    db.run(events.filter(_.userId === userId).sortBy(_.createdAt.desc).take(limit).result).recoverWith { case _ =>
      fallback.findByUserId(userId, limit)
    }
  }
}

class InMemoryEventRepository extends EventRepository {
  private val eventStore = java.util.concurrent.ConcurrentHashMap.newKeySet[ProgressEvent]()

  override def save(event: ProgressEvent): Future[ProgressEvent] = {
    import scala.jdk.CollectionConverters._
    eventStore.removeIf(_.id == event.id)
    eventStore.add(event)
    Future.successful(event)
  }

  override def findByUserId(userId: String, limit: Int = 50): Future[Seq[ProgressEvent]] = {
    import scala.jdk.CollectionConverters._
    Future.successful(eventStore.asScala.filter(_.userId == userId).toSeq.sortBy(_.createdAt.toEpochMilli).reverse.take(limit))
  }
}
