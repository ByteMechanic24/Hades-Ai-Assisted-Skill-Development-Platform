package com.hades.repositories

import com.hades.models.Recommendation
import slick.jdbc.PostgresProfile.api._
import java.sql.Timestamp
import scala.concurrent.{ExecutionContext, Future}

trait RecommendationRepository {
  def saveAll(userId: String, recommendations: Seq[Recommendation]): Future[Seq[Recommendation]]
  def findByUserId(userId: String): Future[Seq[Recommendation]]
}

class PostgresRecommendationRepository(db: Database)(implicit ec: ExecutionContext) extends RecommendationRepository {

  private class RecommendationTable(tag: Tag) extends Table[Recommendation](tag, "recommendations") {
    def id = column[String]("id", O.PrimaryKey)
    def userId = column[String]("user_id")
    def resourceId = column[String]("resource_id")
    def score = column[Double]("score")
    def explanation = column[String]("explanation")
    def createdAt = column[Timestamp]("created_at")

    def * = (id, userId, resourceId, score, explanation, createdAt).shaped <> (
      { case (id, uId, rId, score, exp, createdAt) =>
        Recommendation(id, uId, rId, score, exp, createdAt.toInstant)
      },
      { rec: Recommendation =>
        Some((rec.id, rec.userId, rec.resourceId, rec.score, rec.explanation, Timestamp.from(rec.createdAt)))
      }
    )
  }

  private val recommendationsTable = TableQuery[RecommendationTable]

  override def saveAll(userId: String, items: Seq[Recommendation]): Future[Seq[Recommendation]] = {
    val deleteAction = recommendationsTable.filter(_.userId === userId).delete
    val insertAction = recommendationsTable ++= items
    db.run(DBIO.seq(deleteAction, insertAction).transactionally).map(_ => items)
  }

  override def findByUserId(userId: String): Future[Seq[Recommendation]] = {
    db.run(recommendationsTable.filter(_.userId === userId).sortBy(_.score.desc).result)
  }
}

class InMemoryRecommendationRepository extends RecommendationRepository {
  private val recStore = java.util.concurrent.ConcurrentHashMap.newKeySet[Recommendation]()

  override def saveAll(userId: String, items: Seq[Recommendation]): Future[Seq[Recommendation]] = {
    import scala.jdk.CollectionConverters._
    recStore.removeIf(_.userId == userId)
    items.foreach(recStore.add)
    Future.successful(items)
  }

  override def findByUserId(userId: String): Future[Seq[Recommendation]] = {
    import scala.jdk.CollectionConverters._
    Future.successful(recStore.asScala.filter(_.userId == userId).toSeq.sortBy(_.score).reverse)
  }
}
