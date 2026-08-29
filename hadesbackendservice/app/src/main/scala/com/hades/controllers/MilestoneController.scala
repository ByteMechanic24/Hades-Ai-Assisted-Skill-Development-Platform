package com.hades.controllers

import org.apache.pekko.http.scaladsl.model.{ContentTypes, HttpEntity, StatusCodes}
import org.apache.pekko.http.scaladsl.server.Directives._
import org.apache.pekko.http.scaladsl.server.Route
import com.hades.clients.AuthClient
import com.hades.errors.ApiErrorProtocol._
import com.hades.errors._
import com.hades.schemas.ApiJsonProtocol._
import com.hades.schemas.MilestoneBadgeResponse
import com.hades.repositories.{LearningPathRepository, MilestoneRepository}
import spray.json._
import scala.concurrent.ExecutionContext
import scala.util.{Failure, Success}

class MilestoneController(
  authClient: AuthClient,
  milestoneRepo: MilestoneRepository,
  learningPathRepo: LearningPathRepository
)(implicit ec: ExecutionContext) {

  private def jsonEntity(jsonString: String): HttpEntity.Strict =
    HttpEntity(ContentTypes.`application/json`, jsonString)

  private def errorResponse(status: StatusCodes.ClientError, code: String, message: String): Route = {
    val errJson = ApiErrorResponse(ErrorDetails(code, message)).toJson.compactPrint
    complete(status, jsonEntity(errJson))
  }

  val route: Route = path("api" / "milestones") {
    get {
      optionalHeaderValueByName("Authorization") { authHeaderOpt =>
        optionalHeaderValueByName("X-User-Id") { customHeaderOpt =>
          val token = authHeaderOpt.orElse(customHeaderOpt).getOrElse("dev-user-1")
          onComplete(authClient.authenticate(token)) {
            case Success(Some(user)) =>
              val badges = Seq(
                MilestoneBadgeResponse("ms_01", "Foundations & High-Dimensional Vectors", "Phase 1", "completed", "Aug 14, 2026", 100, Seq("Vector Math", "Cosine Distance", "Latent Embeddings")),
                MilestoneBadgeResponse("ms_02", "Production Vector Search & HNSW Indexing", "Phase 1", "in_progress", "Target: Aug 30, 2026", 65, Seq("pgvector", "Qdrant", "HNSW Tuning")),
                MilestoneBadgeResponse("ms_03", "Autonomous Multi-Agent Swarms & Tool Calling", "Phase 2", "locked", "Target: Sep 15, 2026", 0, Seq("LangGraph", "Stateful Agents", "Async Tools")),
                MilestoneBadgeResponse("ms_04", "Production LLMOps & Evaluation Pipelines", "Phase 3", "locked", "Target: Oct 01, 2026", 0, Seq("RAG Evaluation", "Ragas Framework", "Tracing"))
              )
              val jsonStr = JsArray(badges.map(_.toJson).toVector).compactPrint
              complete(StatusCodes.OK, jsonEntity(jsonStr))
            case _ =>
              errorResponse(StatusCodes.Unauthorized, "UNAUTHORIZED", "Invalid authentication token.")
          }
        }
      }
    }
  }
}
