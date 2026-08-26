package com.hades.controllers

import org.apache.pekko.http.scaladsl.model._
import org.apache.pekko.http.scaladsl.model.headers.RawHeader
import org.apache.pekko.http.scaladsl.testkit.ScalatestRouteTest
import com.hades.clients.AuthClient
import com.hades.models.{LearnerProfile, User}
import com.hades.schemas.ProfileUpdateRequest
import com.hades.services.LearnerProfileService
import org.junit.runner.RunWith
import org.scalatest.matchers.should.Matchers
import org.scalatest.wordspec.AnyWordSpec
import org.scalatestplus.junit.JUnitRunner

import scala.concurrent.Future

class MockAuthClient extends AuthClient {
  override def authenticate(token: String): Future[Option[User]] = {
    val cleanToken = token.stripPrefix("Bearer ").trim
    if (cleanToken == "invalid-token") Future.successful(None)
    else Future.successful(Some(User("dev-user-1", "dev@hades.ai", "Default Learner")))
  }
}

class MockLearnerProfileService extends LearnerProfileService {
  private var mockProfile = LearnerProfile("dev-user-1", "beginner", 60, 5, "Machine Learning Engineer", Seq("hands_on", "video"))

  override def getProfile(userId: String): Future[LearnerProfile] =
    Future.successful(mockProfile)

  override def updateProfile(userId: String, req: ProfileUpdateRequest): Future[LearnerProfile] = {
    mockProfile = mockProfile.copy(
      experienceLevel = req.experienceLevel.getOrElse(mockProfile.experienceLevel),
      minutesPerDay = req.minutesPerDay.getOrElse(mockProfile.minutesPerDay),
      daysPerWeek = req.daysPerWeek.getOrElse(mockProfile.daysPerWeek),
      targetRole = req.targetRole.getOrElse(mockProfile.targetRole),
      learningPreferences = req.learningPreferences.getOrElse(mockProfile.learningPreferences)
    )
    Future.successful(mockProfile)
  }
}

@RunWith(classOf[JUnitRunner])
class LearnerProfileControllerSpec extends AnyWordSpec with Matchers with ScalatestRouteTest {

  "LearnerProfileController" should {

    "return 200 OK for GET /api/profile with valid auth" in {
      val authClient = new MockAuthClient()
      val profileService = new MockLearnerProfileService()
      val controller = new LearnerProfileController(authClient, profileService)

      Get("/api/profile") ~> RawHeader("Authorization", "Bearer dev-user-1") ~> controller.route ~> check {
        status shouldBe StatusCodes.OK
        contentType shouldBe ContentTypes.`application/json`
        val body = responseAs[String]
        body should include("dev-user-1")
        body should include("Machine Learning Engineer")
      }
    }

    "return 200 OK for PUT /api/profile with valid JSON payload" in {
      val authClient = new MockAuthClient()
      val profileService = new MockLearnerProfileService()
      val controller = new LearnerProfileController(authClient, profileService)

      val updateJson =
        """{
          |  "experienceLevel": "intermediate",
          |  "minutesPerDay": 45,
          |  "daysPerWeek": 4,
          |  "targetRole": "Data Scientist",
          |  "learningPreferences": ["hands_on", "project_based"]
          |}""".stripMargin

      Put("/api/profile", HttpEntity(ContentTypes.`application/json`, updateJson)) ~>
        RawHeader("Authorization", "Bearer dev-user-1") ~> controller.route ~> check {
          status shouldBe StatusCodes.OK
          contentType shouldBe ContentTypes.`application/json`
          val body = responseAs[String]
          body should include("Data Scientist")
          body should include("intermediate")
        }
    }

    "return 400 Bad Request for PUT /api/profile with malformed JSON" in {
      val authClient = new MockAuthClient()
      val profileService = new MockLearnerProfileService()
      val controller = new LearnerProfileController(authClient, profileService)

      Put("/api/profile", HttpEntity(ContentTypes.`application/json`, "{ invalid: ")) ~>
        RawHeader("Authorization", "Bearer dev-user-1") ~> controller.route ~> check {
          status shouldBe StatusCodes.BadRequest
          val body = responseAs[String]
          body should include("INVALID_JSON")
        }
    }

    "return 401 Unauthorized for invalid auth token" in {
      val authClient = new MockAuthClient()
      val profileService = new MockLearnerProfileService()
      val controller = new LearnerProfileController(authClient, profileService)

      Get("/api/profile") ~> RawHeader("Authorization", "Bearer invalid-token") ~> controller.route ~> check {
        status shouldBe StatusCodes.Unauthorized
        val body = responseAs[String]
        body should include("UNAUTHORIZED")
      }
    }
  }
}
