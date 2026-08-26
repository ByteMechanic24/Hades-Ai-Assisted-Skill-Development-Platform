package com.hades.services

import com.hades.models.Recommendation
import com.hades.repositories.{LearnerProfileRepository, RecommendationRepository, ResourceRepository}
import java.time.Instant
import java.util.UUID
import scala.concurrent.{ExecutionContext, Future}

trait RecommendationService {
  def getRecommendations(userId: String): Future[Seq[Recommendation]]
  def generateRecommendations(userId: String): Future[Seq[Recommendation]]
}

class RecommendationServiceImpl(
  recommendationRepo: RecommendationRepository,
  resourceRepo: ResourceRepository,
  profileRepo: LearnerProfileRepository
)(implicit ec: ExecutionContext) extends RecommendationService {

  override def getRecommendations(userId: String): Future[Seq[Recommendation]] = {
    recommendationRepo.findByUserId(userId).flatMap { existing =>
      if (existing.nonEmpty) Future.successful(existing)
      else generateRecommendations(userId)
    }
  }

  override def generateRecommendations(userId: String): Future[Seq[Recommendation]] = {
    for {
      profileOpt <- profileRepo.findByUserId(userId)
      resources <- resourceRepo.listAll()
    } yield {
      val profile = profileOpt.getOrElse(com.hades.models.LearnerProfile(userId = userId))
      val scoredResources = resources.map { r =>
        var score = r.qualityScore

        // Difficulty match
        if (r.difficulty.equalsIgnoreCase(profile.experienceLevel)) score += 0.3

        // Duration match
        if (r.durationMinutes <= profile.minutesPerDay) score += 0.2

        val explanation = s"Recommended because it matches your ${profile.experienceLevel} level, ${r.contentType} preference, and ${profile.minutesPerDay}-minute daily availability."
        (r, score, explanation)
      }.sortBy(_._2).reverse.take(5)

      val recs = scoredResources.map { case (r, score, exp) =>
        Recommendation(
          id = UUID.randomUUID().toString,
          userId = userId,
          resourceId = r.id,
          score = score,
          explanation = exp,
          createdAt = Instant.now()
        )
      }

      recommendationRepo.saveAll(userId, recs)
      recs
    }
  }
}
