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

    "successfully post request to /ai/orchestrate and parse response" in {
      val mockRoute = concat(
        path("ai" / "orchestrate") {
          post {
            complete(
              StatusCodes.OK,
              HttpEntity(
                ContentTypes.`application/json`,
                """{
                  |  "session_id": "test-sess-1",
                  |  "learner_id": "learner-1049",
                  |  "status": "READY",
                  |  "active_topic": "Foundations of AI",
                  |  "current_chunk": {
                  |    "chunk_id": "c1",
                  |    "roadmap_id": "r1",
                  |    "sequence_number": 1,
                  |    "title": "MLE Path",
                  |    "milestones": [
                  |      {
                  |        "milestone_id": "m1",
                  |        "order": 1,
                  |        "title": "Milestone 1",
                  |        "objective": "Basics",
                  |        "prerequisite_skills": ["Python"],
                  |        "modules": [
                  |          {
                  |            "module_id": "mod-1",
                  |            "title": "Module 1",
                  |            "description": "Python intro",
                  |            "topics": ["Python"],
                  |            "estimated_hours": 10.0,
                  |            "learning_style": "hands-on",
                  |            "key_deliverable": "Project"
                  |          }
                  |        ],
                  |        "estimated_hours": 10.0
                  |      }
                  |    ],
                  |    "topics": ["Python"],
                  |    "has_more": false
                  |  },
                  |  "available_topics": ["Python"],
                  |  "can_continue": true,
                  |  "more_roadmap_needed": false,
                  |  "next_recommended_action": "WAIT_FOR_LEARNER",
                  |  "rationale": "Ready"
                  |}""".stripMargin
              )
            )
          }
        },
        path("internal" / "ai" / "generate-learning-path") {
          post {
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
          }
        }
      )

      val bindingFuture = Http().newServerAt("127.0.0.1", 0).bind(mockRoute)
      val binding = bindingFuture.futureValue
      val client = new HttpAiServiceClient(s"http://127.0.0.1:${binding.localAddress.getPort}")

      try {
        val responseFuture: Future[LearningPathResponse] = client.generateLearningPath(sampleRequest)
        val response = responseFuture.futureValue

        response.title shouldBe "MLE Path"
        response.estimatedHours shouldBe 10
        response.skills should have size 1
        response.milestones should have size 1
      } finally {
        binding.unbind()
      }
    }

    "fail with AiServiceUnavailableException when service is unreachable and fallbackToMock is false" in {
      val client = new HttpAiServiceClient("http://127.0.0.1:59999")
      val responseFuture = client.generateLearningPath(sampleRequest)

      whenReady(responseFuture.failed) { ex =>
        ex shouldBe a[AiServiceUnavailableException]
      }
    }

    "fail with AiServiceException when AI service returns non-2xx status code and fallbackToMock is false" in {
      val mockRoute = concat(
        path("ai" / "orchestrate") {
          post {
            complete(StatusCodes.InternalServerError, "Internal AI Failure")
          }
        },
        path("internal" / "ai" / "generate-learning-path") {
          post {
            complete(StatusCodes.InternalServerError, "Internal AI Failure")
          }
        }
      )

      val binding = Http().newServerAt("127.0.0.1", 0).bind(mockRoute).futureValue
      val client = new HttpAiServiceClient(s"http://127.0.0.1:${binding.localAddress.getPort}")

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
      val mockRoute = concat(
        path("ai" / "orchestrate") {
          post {
            complete(StatusCodes.OK, HttpEntity(ContentTypes.`application/json`, "INVALID_JSON_CONTENT"))
          }
        },
        path("internal" / "ai" / "generate-learning-path") {
          post {
            complete(StatusCodes.OK, HttpEntity(ContentTypes.`application/json`, "INVALID_JSON_CONTENT"))
          }
        }
      )

      val binding = Http().newServerAt("127.0.0.1", 0).bind(mockRoute).futureValue
      val client = new HttpAiServiceClient(s"http://127.0.0.1:${binding.localAddress.getPort}")

      try {
        val responseFuture = client.generateLearningPath(sampleRequest)
        whenReady(responseFuture.failed) { ex =>
          ex shouldBe a[AiServiceException]
        }
      } finally {
        binding.unbind()
      }
    }

    "successfully chat with AI assistant endpoint" in {
      val mockRoute = path("ai" / "assistant" / "chat") {
        post {
          complete(
            StatusCodes.OK,
            HttpEntity(
              ContentTypes.`application/json`,
              """{"learner_id":"u1","session_id":"s1","message":"Hello learner, keep practicing!"}"""
            )
          )
        }
      }

      val binding = Http().newServerAt("127.0.0.1", 0).bind(mockRoute).futureValue
      val client = new HttpAiServiceClient(s"http://127.0.0.1:${binding.localAddress.getPort}")

      try {
        val reply = client.chat("How to start?", "Beginner ML").futureValue
        reply shouldBe "Hello learner, keep practicing!"
      } finally {
        binding.unbind()
      }
    }
  }
}
