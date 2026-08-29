package com.hades.controllers

import org.apache.pekko.http.scaladsl.model.{ContentTypes, HttpEntity, StatusCodes}
import org.apache.pekko.http.scaladsl.server.Directives._
import org.apache.pekko.http.scaladsl.server.Route
import com.hades.errors.ApiErrorProtocol._
import com.hades.errors._
import com.hades.schemas.ApiJsonProtocol._
import com.hades.schemas.ResourceDetailResponse
import com.hades.services.ResourceService
import spray.json._
import scala.concurrent.ExecutionContext
import scala.util.{Failure, Success}

class ResourceController(resourceService: ResourceService)(implicit ec: ExecutionContext) {

  private def jsonEntity(jsonString: String): HttpEntity.Strict =
    HttpEntity(ContentTypes.`application/json`, jsonString)

  private def errorResponse(status: StatusCodes.ClientError, code: String, message: String): Route = {
    val errJson = ApiErrorResponse(ErrorDetails(code, message)).toJson.compactPrint
    complete(status, jsonEntity(errJson))
  }

  private val defaultResources = Seq(
    ResourceDetailResponse(
      id = "res_01",
      title = "HNSW Vector Indexes & Quantization in Practice",
      provider = "DeepLearning.AI",
      `type` = "Interactive Lab",
      format = "interactive",
      duration = "45 mins",
      difficulty = "Intermediate",
      rating = 4.9,
      reviewsCount = 312,
      matchScore = 98,
      whyRecommended = "Directly aligns with your Vector Database & Hybrid Search milestone.",
      skillsCovered = Seq("Vector Databases", "HNSW Indexing", "pgvector"),
      progress = 60,
      isSaved = true,
      thumbnail = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
      url = "https://www.deeplearning.ai/"
    ),
    ResourceDetailResponse(
      id = "res_02",
      title = "Stateful Multi-Agent Swarms with LangGraph & Autonomous Tool Calling",
      provider = "LangChain Academy",
      `type` = "Video Course",
      format = "video",
      duration = "1.5 hours",
      difficulty = "Advanced",
      rating = 4.8,
      reviewsCount = 524,
      matchScore = 95,
      whyRecommended = "Essential for building production agentic systems.",
      skillsCovered = Seq("Agentic Swarms", "LangGraph", "Tool Calling"),
      progress = 20,
      isSaved = false,
      thumbnail = "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&auto=format&fit=crop&q=80",
      url = "https://academy.langchain.com/"
    ),
    ResourceDetailResponse(
      id = "res_03",
      title = "Production RAG Architecture & Contextual Re-ranking Deep Dive",
      provider = "Pinecone Labs",
      `type` = "Documentation & Article",
      format = "article",
      duration = "30 mins",
      difficulty = "Intermediate",
      rating = 4.7,
      reviewsCount = 189,
      matchScore = 91,
      whyRecommended = "High-impact guide for latency reduction in RAG pipelines.",
      skillsCovered = Seq("BM25", "Cross-Encoders", "RAG Systems"),
      progress = 0,
      isSaved = true,
      thumbnail = "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80",
      url = "https://www.pinecone.io/learn/"
    )
  )

  val route: Route = pathPrefix("api" / "resources") {
    concat(
      pathEndOrSingleSlash {
        get {
          parameters("format".optional, "difficulty".optional, "saved".as[Boolean].optional) { (formatOpt, diffOpt, savedOpt) =>
            var filtered = defaultResources
            formatOpt.foreach(fmt => filtered = filtered.filter(_.format.equalsIgnoreCase(fmt)))
            diffOpt.foreach(diff => filtered = filtered.filter(_.difficulty.equalsIgnoreCase(diff)))
            savedOpt.foreach(saved => if (saved) filtered = filtered.filter(_.isSaved))
            val jsonStr = JsArray(filtered.map(_.toJson).toVector).compactPrint
            complete(StatusCodes.OK, jsonEntity(jsonStr))
          }
        }
      },
      path(Segment) { id =>
        get {
          defaultResources.find(_.id == id) match {
            case Some(r) =>
              complete(StatusCodes.OK, jsonEntity(r.toJson.compactPrint))
            case None =>
              errorResponse(StatusCodes.NotFound, "NOT_FOUND", s"Resource '$id' not found.")
          }
        }
      }
    )
  }
}
