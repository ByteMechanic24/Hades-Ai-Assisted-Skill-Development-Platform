package com.hades.repositories

import com.hades.models.RiasecResult
import slick.jdbc.PostgresProfile.api._
import java.sql.Timestamp
import scala.concurrent.{ExecutionContext, Future}

trait RiasecRepository {
  def save(result: RiasecResult): Future[RiasecResult]
  def findByUserId(userId: String): Future[Option[RiasecResult]]
}

class PostgresRiasecRepository(db: Database)(implicit ec: ExecutionContext) extends RiasecRepository {
  private val fallback = new InMemoryRiasecRepository()

  private class RiasecTable(tag: Tag) extends Table[RiasecResult](tag, "riasec_results") {
    def id = column[String]("id", O.PrimaryKey)
    def userId = column[String]("user_id")
    def realistic = column[Double]("realistic")
    def investigative = column[Double]("investigative")
    def artistic = column[Double]("artistic")
    def social = column[Double]("social")
    def enterprising = column[Double]("enterprising")
    def conventional = column[Double]("conventional")
    def createdAt = column[Timestamp]("created_at")
    def updatedAt = column[Timestamp]("updated_at")

    def * = (id, userId, realistic, investigative, artistic, social, enterprising, conventional, createdAt, updatedAt).shaped <> (
      { case (id, userId, r, i, a, s, e, c, createdAt, updatedAt) =>
        RiasecResult(id, userId, r, i, a, s, e, c, createdAt.toInstant, updatedAt.toInstant)
      },
      { res: RiasecResult =>
        Some((res.id, res.userId, res.realistic, res.investigative, res.artistic, res.social, res.enterprising, res.conventional, Timestamp.from(res.createdAt), Timestamp.from(res.updatedAt)))
      }
    )
  }

  private val riasecs = TableQuery[RiasecTable]

  override def save(result: RiasecResult): Future[RiasecResult] = {
    val action = riasecs.insertOrUpdate(result)
    db.run(action).map(_ => result).recoverWith { case _ =>
      fallback.save(result)
    }
  }

  override def findByUserId(userId: String): Future[Option[RiasecResult]] = {
    db.run(riasecs.filter(_.userId === userId).result.headOption).recoverWith { case _ =>
      fallback.findByUserId(userId)
    }
  }
}

class InMemoryRiasecRepository extends RiasecRepository {
  private val store = java.util.concurrent.ConcurrentHashMap.newKeySet[RiasecResult]()

  override def save(result: RiasecResult): Future[RiasecResult] = {
    import scala.jdk.CollectionConverters._
    store.removeIf(_.userId == result.userId)
    store.add(result)
    Future.successful(result)
  }

  override def findByUserId(userId: String): Future[Option[RiasecResult]] = {
    import scala.jdk.CollectionConverters._
    Future.successful(store.asScala.find(_.userId == userId))
  }
}
