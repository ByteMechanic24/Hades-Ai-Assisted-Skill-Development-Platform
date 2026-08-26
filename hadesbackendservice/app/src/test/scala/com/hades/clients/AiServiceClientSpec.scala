package com.hades.clients

import org.apache.pekko.actor.typed.ActorSystem
import org.apache.pekko.actor.typed.scaladsl.Behaviors
import org.apache.pekko.http.scaladsl.Http
import org.apache.pekko.http.scaladsl.model._
import org.apache.pekko.http.scaladsl.server.Directives._
import com.hades.errors.{AiServiceException, AiServiceUnavailableException}
import com.hades.schemas._
import org.junit.runner.RunWith
import org.scalatest.concurrent.ScalaFutures
import org.scalatest.matchers.should.Matchers
import org.scalatest.wordspec.AnyWordSpec
import org.scalatest.time.{Millis, Seconds, Span}
import org.scalatestplus.junit.JUnitRunner

import scala.concurrent.Future

@RunWith(classOf[JUnitRunner])
class AiServiceClientSpec extends AnyWordSpec with Matchers with ScalaFutures {

  implicit val defaultPatience: PatienceConfig = PatienceConfig(timeout = Span(5, Seconds), interval = Span(50, Millis))
  implicit val system: ActorSystem[Nothing] = ActorSystem(Behaviors.empty, "AiServiceClientSpecSystem")

  private val sampleRequest = LearningPathRequest(
    learner = LearnerContext(
      experienceLevel = "beginner",
      interests = Seq("AI"),
      career = CareerContext(targetRole = "MLE"),
      learningPreferences = Seq("hands_on"),
      availability = LearningAvailability(60, 5),
      existingSkills = Seq(SkillConfidence("Python", 0.8)),
      completedLearning = Seq(CompletedLearning("Python 101", "course")),
      riasec = None
    ),
    goal = LearningGoalRequest("Learn ML", "Basics")
  )

  "HttpAiServiceClient" should {

    "successfully post request to /internal/ai/generate-learning-path and parse response" in {
      val mockRoute = path("internal" / "ai" / "generate-learning-path") {
        post {
          entity(as[String]) { body =>
            if (body.contains("beginner") && body.contains("Learn ML")) {
              complete(
                StatusCodes.OK,
                HttpEntity(
                  ContentTypes.`application/json`,
                  """{
                    |  "title": "MLE Path",
                    |  "description": "Mock Roadmap",
                    |  "estimated_hours": 80,
                    |  "skills": [{"id":"s1","name":"Python","difficulty":"beginner"}],
                    |  "milestones": [{"id":"m1","title":"Milestone 1"}]
                    |}""".stripMargin
                )
              )
            } else {
              complete(StatusCodes.BadRequest, "Bad payload")
            }
          }
        }
      }

      val bindingFuture = Http().newServerAt("127.0.0.1", 0).bind(mockRoute)
      val binding = bindingFuture.futureValue
      val client = new HttpAiServiceClient(s"http://127.0.0.1:${binding.localAddress.getPort}")

      try {
        val responseFuture: Future[LearningPathResponse] = client.generateLearningPath(sampleRequest)
        val response = responseFuture.futureValue

        response.title shouldBe "MLE Path"
        response.estimatedHours shouldBe 80
        response.skills should have size 1
        response.milestones should have size 1
      } finally {
        binding.unbind()
      }
    }

    "fail with AiServiceUnavailableException when service is unreachable and fallbackToMock is false" in {
      val client = new HttpAiServiceClient("http://127.0.0.1:59999", fallbackToMock = false)
      val responseFuture = client.generateLearningPath(sampleRequest)

      whenReady(responseFuture.failed) { ex =>
        ex shouldBe a[AiServiceUnavailableException]
      }
    }

    "fail with AiServiceException when AI service returns non-2xx status code and fallbackToMock is false" in {
      val mockRoute = path("internal" / "ai" / "generate-learning-path") {
        post {
          complete(StatusCodes.InternalServerError, "Internal AI Failure")
        }
      }

      val binding = Http().newServerAt("127.0.0.1", 0).bind(mockRoute).futureValue
      val client = new HttpAiServiceClient(s"http://127.0.0.1:${binding.localAddress.getPort}", fallbackToMock = false)

      try {
        val responseFuture = client.generateLearningPath(sampleRequest)
        whenReady(responseFuture.failed) { ex =>
          ex shouldBe a[AiServiceException]
          ex.asInstanceOf[AiServiceException].statusCode shouldBe 500
        }
      } finally {
        binding.unbind()
      }
    }

    "fail with AiServiceException when AI service returns invalid JSON and fallbackToMock is false" in {
      val mockRoute = path("internal" / "ai" / "generate-learning-path") {
        post {
          complete(StatusCodes.OK, HttpEntity(ContentTypes.`application/json`, "INVALID_JSON_CONTENT"))
        }
      }

      val binding = Http().newServerAt("127.0.0.1", 0).bind(mockRoute).futureValue
      val client = new HttpAiServiceClient(s"http://127.0.0.1:${binding.localAddress.getPort}", fallbackToMock = false)

      try {
        val responseFuture = client.generateLearningPath(sampleRequest)
        whenReady(responseFuture.failed) { ex =>
          ex shouldBe a[AiServiceException]
        }
      } finally {
        binding.unbind()
      }
    }
  }
}
