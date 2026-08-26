package com.hades.clients

import org.apache.pekko.actor.typed.ActorSystem
import org.apache.pekko.http.scaladsl.Http
import org.apache.pekko.http.scaladsl.model._
import org.apache.pekko.http.scaladsl.unmarshalling.Unmarshal
import com.hades.errors.{AiServiceException, AiServiceUnavailableException}
import com.hades.schemas.LearningPathJsonProtocol._
import com.hades.schemas._
import spray.json._

import scala.concurrent.{ExecutionContext, Future}
import scala.util.Try

trait AiServiceClient {
  def generateLearningPath(
    request: LearningPathRequest
  ): Future[LearningPathResponse]

  def chat(
    message: String,
    context: String
  ): Future[String]
}

class HttpAiServiceClient(baseUrl: String, fallbackToMock: Boolean = true)(implicit system: ActorSystem[_])
  extends AiServiceClient {

  private implicit val ec: ExecutionContext = system.executionContext
  private val endpoint = s"${baseUrl.stripSuffix("/")}/internal/ai/generate-learning-path"

  private def generateMockLearningPath(request: LearningPathRequest): LearningPathResponse = {
    val targetRole = if (request != null && request.learner != null && request.learner.career != null && request.learner.career.targetRole.nonEmpty) {
      request.learner.career.targetRole
    } else {
      "Autonomous AI Systems Engineer"
    }

    val expLevel = if (request != null && request.learner != null && request.learner.experienceLevel.nonEmpty) {
      request.learner.experienceLevel
    } else {
      "Intermediate"
    }

    val title = s"Personalized Roadmap: $targetRole"
    val desc = s"AI-curated learning path tailored for $expLevel level to master $targetRole with hands-on labs and project modules."

    val skills = Seq(
      SkillResponse("sk-1", "High-Dimensional Vector Math & Embeddings", "Intermediate"),
      SkillResponse("sk-2", "Vector Databases & Hybrid Search (pgvector/Qdrant)", "Intermediate"),
      SkillResponse("sk-3", "Agentic Tool Calling & Production LLMOps", "Advanced")
    )

    val nodes = Seq(
      LearningPathNodeResponse(
        id = "node-1",
        title = s"Foundations of $targetRole",
        description = "Master core mathematical representations, latent spaces, and vector similarity metrics.",
        skillIds = Seq("sk-1"),
        prerequisiteIds = Nil,
        estimatedHours = 15,
        sequence = 1
      ),
      LearningPathNodeResponse(
        id = "node-2",
        title = "Vector Search & Hybrid Indexing Deep Dive",
        description = "Hands-on implementation of HNSW index tuning, BM25 lexical search, and semantic re-ranking.",
        skillIds = Seq("sk-2"),
        prerequisiteIds = Seq("node-1"),
        estimatedHours = 25,
        sequence = 2
      ),
      LearningPathNodeResponse(
        id = "node-3",
        title = "Autonomous Multi-Agent Swarms & Tool Calling",
        description = "Design resilient stateful agents, memory persistence, and asynchronous tool orchestration.",
        skillIds = Seq("sk-3"),
        prerequisiteIds = Seq("node-2"),
        estimatedHours = 35,
        sequence = 3
      )
    )

    val milestones = Seq(
      MilestoneResponse("ms-1", "Phase 1: Foundations & Vector Architecture", Seq("node-1")),
      MilestoneResponse("ms-2", "Phase 2: Production RAG & Agentic Systems", Seq("node-2", "node-3"))
    )

    LearningPathResponse(
      title = title,
      description = desc,
      estimatedHours = 75,
      skills = skills,
      nodes = nodes,
      milestones = milestones
    )
  }

  private def generateMockChatReply(message: String): String = {
    s"**HADES AI Coach**: I received your query: \"$message\". Based on your current roadmap for Autonomous AI Systems Engineer, I recommend completing the Vector Search & Hybrid Indexing module first to maximize your learning velocity."
  }

  override def generateLearningPath(request: LearningPathRequest): Future[LearningPathResponse] = {
    val requestJson = if (request != null) request.toJson.compactPrint else "{}"
    val httpRequest = HttpRequest(
      method = HttpMethods.POST,
      uri = endpoint,
      entity = HttpEntity(ContentTypes.`application/json`, requestJson)
    )

    Http()
      .singleRequest(httpRequest)
      .flatMap { response =>
        if (response.status.isSuccess()) {
          Unmarshal(response.entity).to[String].flatMap { body =>
            Future {
              body.parseJson.convertTo[LearningPathResponse]
            }.recoverWith { case parseError: Throwable =>
              Future.failed(new AiServiceException(response.status.intValue(), s"Invalid AI service JSON response: ${parseError.getMessage}"))
            }
          }
        } else {
          Unmarshal(response.entity).to[String].flatMap { errorBody =>
            Future.failed(new AiServiceException(response.status.intValue(), s"AI service error (${response.status.intValue()}): $errorBody"))
          }
        }
      }
      .recoverWith { case cause: Throwable =>
        if (fallbackToMock) {
          Future.successful(generateMockLearningPath(request))
        } else {
          cause match {
            case ex: AiServiceException => Future.failed(ex)
            case ex: AiServiceUnavailableException => Future.failed(ex)
            case other => Future.failed(new AiServiceUnavailableException("The AI service is currently unavailable.", other))
          }
        }
      }
  }

  override def chat(message: String, context: String): Future[String] = {
    val chatEndpoint = s"${baseUrl.stripSuffix("/")}/internal/ai/chat"
    val payload = JsObject(
      "message" -> JsString(message),
      "context" -> JsString(context)
    ).compactPrint

    val httpRequest = HttpRequest(
      method = HttpMethods.POST,
      uri = chatEndpoint,
      entity = HttpEntity(ContentTypes.`application/json`, payload)
    )

    Http()
      .singleRequest(httpRequest)
      .flatMap { response =>
        if (response.status.isSuccess()) {
          Unmarshal(response.entity).to[String].map { body =>
            Try(body.parseJson.asJsObject.fields.get("reply").collect { case JsString(r) => r })
              .toOption.flatten.getOrElse(body)
          }
        } else {
          Unmarshal(response.entity).to[String].flatMap { errorBody =>
            Future.failed(new AiServiceException(response.status.intValue(), s"AI service error (${response.status.intValue()}): $errorBody"))
          }
        }
      }
      .recoverWith { case cause: Throwable =>
        if (fallbackToMock) {
          Future.successful(generateMockChatReply(message))
        } else {
          cause match {
            case ex: AiServiceException => Future.failed(ex)
            case ex: AiServiceUnavailableException => Future.failed(ex)
            case other => Future.failed(new AiServiceUnavailableException("The AI service is currently unavailable.", other))
          }
        }
      }
  }
}
