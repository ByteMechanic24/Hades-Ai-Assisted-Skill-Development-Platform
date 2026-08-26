package com.hades.controllers

import org.apache.pekko.http.scaladsl.model.{ContentTypes, HttpEntity, StatusCode, StatusCodes}
import org.apache.pekko.http.scaladsl.server.Directives._
import org.apache.pekko.http.scaladsl.server.Route
import com.hades.clients.AuthClient
import com.hades.errors.ApiErrorProtocol._
import com.hades.errors._
import com.hades.schemas.ApiJsonProtocol._
import com.hades.schemas.{AssistantChatRequest, AssistantChatResponse}
import com.hades.services.AssistantService
import spray.json._
import scala.concurrent.ExecutionContext
import scala.util.{Failure, Success, Try}

class AssistantController(
  authClient: AuthClient,
  assistantService: AssistantService
)(implicit ec: ExecutionContext) {

  private def jsonEntity(jsonString: String): HttpEntity.Strict =
    HttpEntity(ContentTypes.`application/json`, jsonString)

  private def errorResponse(status: StatusCodes.ClientError, code: String, message: String): Route = {
    val errJson = ApiErrorResponse(ErrorDetails(code, message)).toJson.compactPrint
    complete(status, jsonEntity(errJson))
  }

  private def errorResponse(status: StatusCodes.ServerError, code: String, message: String): Route = {
    val errJson = ApiErrorResponse(ErrorDetails(code, message)).toJson.compactPrint
    complete(status, jsonEntity(errJson))
  }

  val route: Route = path("api" / "assistant" / "chat") {
    post {
      optionalHeaderValueByName("Authorization") { authHeaderOpt =>
        optionalHeaderValueByName("X-User-Id") { customHeaderOpt =>
          val token = authHeaderOpt.orElse(customHeaderOpt).getOrElse("dev-user-1")
          onComplete(authClient.authenticate(token)) {
            case Success(Some(user)) =>
              entity(as[String]) { jsonStr =>
                Try(jsonStr.parseJson.convertTo[AssistantChatRequest]) match {
                  case Failure(ex) =>
                    errorResponse(StatusCodes.BadRequest, "INVALID_JSON", s"Invalid chat payload: ${ex.getMessage}")
                  case Success(req) =>
                    onComplete(assistantService.chat(user.id, req.message)) {
                      case Success(reply) =>
                        complete(StatusCodes.OK, jsonEntity(AssistantChatResponse(reply).toJson.compactPrint))
                      case Failure(ex: AiServiceUnavailableException) =>
                        errorResponse(StatusCodes.ServiceUnavailable, "AI_SERVICE_UNAVAILABLE", ex.getMessage)
                      case Failure(ex) =>
                        errorResponse(StatusCodes.BadRequest, "CHAT_FAILED", ex.getMessage)
                    }
                }
              }
            case _ =>
              errorResponse(StatusCodes.Unauthorized, "UNAUTHORIZED", "Invalid token.")
          }
        }
      }
    }
  }
}
