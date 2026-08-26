package com.hades.controllers

import java.time.Instant
import org.apache.pekko.http.scaladsl.model._
import org.apache.pekko.http.scaladsl.model.headers.RawHeader
import org.apache.pekko.http.scaladsl.testkit.ScalatestRouteTest
import com.hades.models.{LearnerProfile, LearningGoal}
import com.hades.schemas.OnboardingRequest
import com.hades.services.OnboardingService
import org.junit.runner.RunWith
import org.scalatest.matchers.should.Matchers
import org.scalatest.wordspec.AnyWordSpec
import org.scalatestplus.junit.JUnitRunner

import scala.concurrent.Future

class MockOnboardingService extends OnboardingService {
  override def processOnboarding(userId: String, req: OnboardingRequest): Future[(LearnerProfile, LearningGoal)] = {
    if (req.goalTitle.isEmpty) {
      Future.failed(new IllegalArgumentException("Goal title cannot be empty."))
    } else {
      val profile = LearnerProfile(userId, req.experienceLevel, req.minutesPerDay, req.daysPerWeek, req.targetRole, req.learningPreferences)
      val goal = LearningGoal("goal-1", userId, req.goalTitle, req.goalDescription, true, Instant.now())
      Future.successful((profile, goal))
    }
  }
}

@RunWith(classOf[JUnitRunner])
class OnboardingControllerSpec extends AnyWordSpec with Matchers with ScalatestRouteTest {

  private val validOnboardingPayload =
    """{
      |  "experienceLevel": "beginner",
      |  "minutesPerDay": 60,
      |  "daysPerWeek": 5,
      |  "targetRole": "Machine Learning Engineer",
      |  "interests": ["AI", "Python"],
      |  "learningPreferences": ["hands_on", "video"],
      |  "goalTitle": "Learn ML Fundamentals",
      |  "goalDescription": "Build foundational ML skills"
      |}""".stripMargin

  "OnboardingController" should {

    "return 200 OK for valid POST /api/onboarding" in {
      val authClient = new MockAuthClient()
      val onboardingService = new MockOnboardingService()
      val controller = new OnboardingController(authClient, onboardingService)

      Post("/api/onboarding", HttpEntity(ContentTypes.`application/json`, validOnboardingPayload)) ~>
        RawHeader("Authorization", "Bearer dev-user-1") ~> controller.route ~> check {
          status shouldBe StatusCodes.OK
          contentType shouldBe ContentTypes.`application/json`
          val body = responseAs[String]
          body should include("dev-user-1")
          body should include("Machine Learning Engineer")
        }
    }

    "return 400 Bad Request for POST /api/onboarding with invalid JSON" in {
      val authClient = new MockAuthClient()
      val onboardingService = new MockOnboardingService()
      val controller = new OnboardingController(authClient, onboardingService)

      Post("/api/onboarding", HttpEntity(ContentTypes.`application/json`, "{ invalid_json: ")) ~>
        RawHeader("Authorization", "Bearer dev-user-1") ~> controller.route ~> check {
          status shouldBe StatusCodes.BadRequest
          val body = responseAs[String]
          body should include("INVALID_JSON")
        }
    }
  }
}
