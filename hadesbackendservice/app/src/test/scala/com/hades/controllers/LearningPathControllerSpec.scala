package com.hades.controllers

import org.apache.pekko.http.scaladsl.model._
import org.apache.pekko.http.scaladsl.testkit.ScalatestRouteTest
import com.hades.errors.AiServiceUnavailableException
import com.hades.hadesapi.Routes
import com.hades.schemas._
import com.hades.services.LearningPathService
import org.junit.runner.RunWith
import org.scalatest.matchers.should.Matchers
import org.scalatest.wordspec.AnyWordSpec
import org.scalatestplus.junit.JUnitRunner

import scala.concurrent.Future

class MockLearningPathService(shouldFail: Boolean = false) extends LearningPathService {
  override def generateLearningPath(request: LearningPathRequest): Future[LearningPathResponse] = {
    if (shouldFail) {
      Future.failed(new AiServiceUnavailableException("The AI service is currently unavailable."))
    } else {
      Future.successful(
        LearningPathResponse(
          title = "Mock Generated Path",
          description = "A mock path response for test",
          estimatedHours = 50,
          skills = Seq(SkillResponse("s1", "Python", "beginner")),
          milestones = Seq(MilestoneResponse("m1", "Start Learning"))
        )
      )
    }
  }

  override def generateLearningPathForUser(userId: String): Future[LearningPathResponse] = {
    generateLearningPath(null)
  }

  override def getUserLearningPath(userId: String): Future[Option[LearningPathResponse]] = {
    generateLearningPath(null).map(Some(_))(scala.concurrent.ExecutionContext.global)
  }

  override def getLearningPathById(id: String): Future[Option[LearningPathResponse]] = {
    generateLearningPath(null).map(Some(_))(scala.concurrent.ExecutionContext.global)
  }
}

@RunWith(classOf[JUnitRunner])
class LearningPathControllerSpec extends AnyWordSpec with Matchers with ScalatestRouteTest {

  private val validJsonPayload =
    """{
      |  "learner": {
      |    "experience_level": "beginner",
      |    "interests": ["Python"],
      |    "career": { "target_role": "Data Scientist" },
      |    "learning_preferences": ["video"],
      |    "availability": { "minutes_per_day": 30, "days_per_week": 4 },
      |    "existing_skills": [{ "name": "Python", "confidence": 0.5 }],
      |    "completed_learning": [{ "title": "Intro", "type": "article" }],
      |    "riasec": {
      |      "realistic": 0.5,
      |      "investigative": 0.5,
      |      "artistic": 0.5,
      |      "social": 0.5,
      |      "enterprising": 0.5,
      |      "conventional": 0.5
      |    }
      |  },
      |  "goal": {
      |    "title": "Data Science Basics",
      |    "description": "Learn Data Science"
      |  }
      |}""".stripMargin

  "Routes and LearningPathController" should {

    "return 200 OK for GET /health" in {
      val mockService = new MockLearningPathService()
      val controller = new LearningPathController(mockService)
      val routes = new Routes(controller)

      Get("/health") ~> routes.routes ~> check {
        status shouldBe StatusCodes.OK
        contentType shouldBe ContentTypes.`application/json`
        responseAs[String] shouldBe """{"status":"ok"}"""
      }
    }

    "return 200 OK for valid POST /api/learning-paths" in {
      val mockService = new MockLearningPathService()
      val controller = new LearningPathController(mockService)
      val routes = new Routes(controller)

      val requestEntity = HttpEntity(ContentTypes.`application/json`, validJsonPayload)

      Post("/api/learning-paths", requestEntity) ~> routes.routes ~> check {
        status shouldBe StatusCodes.OK
        contentType shouldBe ContentTypes.`application/json`
        val responseBody = responseAs[String]
        responseBody should include("Mock Generated Path")
        responseBody should include("estimated_hours")
      }
    }

    "return 400 Bad Request for invalid JSON syntax" in {
      val mockService = new MockLearningPathService()
      val controller = new LearningPathController(mockService)
      val routes = new Routes(controller)

      val requestEntity = HttpEntity(ContentTypes.`application/json`, "{ invalid_json: ")

      Post("/api/learning-paths", requestEntity) ~> routes.routes ~> check {
        status shouldBe StatusCodes.BadRequest
        val responseBody = responseAs[String]
        responseBody should include("INVALID_JSON")
      }
    }

    "return 400 Bad Request when validation fails (empty experience_level)" in {
      val mockService = new MockLearningPathService()
      val controller = new LearningPathController(mockService)
      val routes = new Routes(controller)

      val invalidPayload = validJsonPayload.replace("\"experience_level\": \"beginner\"", "\"experience_level\": \"\"")
      val requestEntity = HttpEntity(ContentTypes.`application/json`, invalidPayload)

      Post("/api/learning-paths", requestEntity) ~> routes.routes ~> check {
        status shouldBe StatusCodes.BadRequest
        val responseBody = responseAs[String]
        responseBody should include("VALIDATION_ERROR")
        responseBody should include("learner.experience_level must not be empty")
      }
    }

    "return 503 Service Unavailable when AI service fails" in {
      val mockService = new MockLearningPathService(shouldFail = true)
      val controller = new LearningPathController(mockService)
      val routes = new Routes(controller)

      val requestEntity = HttpEntity(ContentTypes.`application/json`, validJsonPayload)

      Post("/api/learning-paths", requestEntity) ~> routes.routes ~> check {
        status shouldBe StatusCodes.ServiceUnavailable
        val responseBody = responseAs[String]
        responseBody should include("AI_SERVICE_UNAVAILABLE")
      }
    }
  }
}
