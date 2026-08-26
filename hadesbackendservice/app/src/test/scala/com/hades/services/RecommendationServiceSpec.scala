package com.hades.services

import com.hades.models.{LearnerProfile, Resource}
import com.hades.repositories._
import org.junit.runner.RunWith
import org.scalatest.concurrent.ScalaFutures
import org.scalatest.matchers.should.Matchers
import org.scalatest.wordspec.AnyWordSpec
import org.scalatestplus.junit.JUnitRunner

import scala.concurrent.ExecutionContext.Implicits.global

@RunWith(classOf[JUnitRunner])
class RecommendationServiceSpec extends AnyWordSpec with Matchers with ScalaFutures {

  "RecommendationService" should {

    "generate recommendations matching user experience level and availability" in {
      val recRepo = new InMemoryRecommendationRepository()
      val resourceRepo = new InMemoryResourceRepository()
      val profileRepo = new InMemoryLearnerProfileRepository()

      val service = new RecommendationServiceImpl(recRepo, resourceRepo, profileRepo)

      val profile = LearnerProfile("u1", experienceLevel = "beginner", minutesPerDay = 45)
      val res1 = Resource("r1", "Python Basics", "https://example.com/p", difficulty = "beginner", durationMinutes = 30)
      val res2 = Resource("r2", "Advanced Distributed Systems", "https://example.com/d", difficulty = "advanced", durationMinutes = 120)

      profileRepo.save(profile).futureValue
      resourceRepo.save(res1).futureValue
      resourceRepo.save(res2).futureValue

      val recs = service.generateRecommendations("u1").futureValue
      recs should not be empty
      recs.head.resourceId shouldBe "r1"
      recs.head.explanation should include("beginner")
    }
  }
}
