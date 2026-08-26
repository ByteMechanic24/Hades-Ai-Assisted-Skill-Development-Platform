package com.hades.repositories

import com.hades.models.Interest
import slick.jdbc.PostgresProfile.api._
import java.sql.Timestamp
import scala.concurrent.{ExecutionContext, Future}

trait InterestRepository {
  def saveAll(userId: String, interests: Seq[Interest]): Future[Seq[Interest]]
  def findByUserId(userId: String): Future[Seq[Interest]]
}

class PostgresInterestRepository(db: Database)(implicit ec: ExecutionContext) extends InterestRepository {
  private val fallback = new InMemoryInterestRepository()

  private class InterestTable(tag: Tag) extends Table[Interest](tag, "interests") {
    def id = column[String]("id", O.PrimaryKey)
    def userId = column[String]("user_id")
    def name = column[String]("name")
    def createdAt = column[Timestamp]("created_at")

    def * = (id, userId, name, createdAt).shaped <> (
      { case (id, userId, name, createdAt) => Interest(id, userId, name, createdAt.toInstant) },
      { i: Interest => Some((i.id, i.userId, i.name, Timestamp.from(i.createdAt))) }
    )
  }

  private val interests = TableQuery[InterestTable]

  override def saveAll(userId: String, items: Seq[Interest]): Future[Seq[Interest]] = {
    val deleteAction = interests.filter(_.userId === userId).delete
    val insertAction = interests ++= items
    db.run(DBIO.seq(deleteAction, insertAction).transactionally).map(_ => items).recoverWith { case _ =>
      fallback.saveAll(userId, items)
    }
  }

  override def findByUserId(userId: String): Future[Seq[Interest]] = {
    db.run(interests.filter(_.userId === userId).result).recoverWith { case _ =>
      fallback.findByUserId(userId)
    }
  }
}

class InMemoryInterestRepository extends InterestRepository {
  private val store = java.util.concurrent.ConcurrentHashMap.newKeySet[Interest]()

  override def saveAll(userId: String, items: Seq[Interest]): Future[Seq[Interest]] = {
    import scala.jdk.CollectionConverters._
    store.removeIf(_.userId == userId)
    items.foreach(store.add)
    Future.successful(items)
  }

  override def findByUserId(userId: String): Future[Seq[Interest]] = {
    import scala.jdk.CollectionConverters._
    Future.successful(store.asScala.filter(_.userId == userId).toSeq)
  }
}
