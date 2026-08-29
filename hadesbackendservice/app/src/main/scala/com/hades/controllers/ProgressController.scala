package com.hades.controllers

import org.apache.pekko.http.scaladsl.model.{ContentTypes, HttpEntity, StatusCodes}
import org.apache.pekko.http.scaladsl.server.Directives._
import org.apache.pekko.http.scaladsl.server.Route
import com.hades.clients.AuthClient
import com.hades.errors.ApiErrorProtocol._
import com.hades.errors._
import com.hades.schemas.ApiJsonProtocol._
import com.hades.schemas.{ProgressEventDetailResponse, ProgressEventRequest, ProgressStatsResponse}
import com.hades.services.ProgressService
import spray.json._
import scala.concurrent.ExecutionContext
import scala.util.{Failure, Success, Try}

class ProgressController(
  authClient: AuthClient,
  progressService: ProgressService
)(implicit ec: ExecutionContext) {

  private def jsonEntity(jsonString: String): HttpEntity.Strict =
    HttpEntity(ContentTypes.`application/json`, jsonString)

  private def errorResponse(status: StatusCodes.ClientError, code: String, message: String): Route = {
    val errJson = ApiErrorResponse(ErrorDetails(code, message)).toJson.compactPrint
    complete(status, jsonEntity(errJson))
  }

  val route: Route = pathPrefix("api" / "progress") {
    optionalHeaderValueByName("Authorization") { authHeaderOpt =>
      optionalHeaderValueByName("X-User-Id") { customHeaderOpt =>
        val token = authHeaderOpt.orElse(customHeaderOpt).getOrElse("dev-user-1")
        onComplete(authClient.authenticate(token)) {
          case Success(Some(user)) =>
            concat(
              pathEndOrSingleSlash {
                get {
                  onComplete(progressService.getEvents(user.id)) {
                    case Success(events) =>
                      val arr = JsArray(events.map { e =>
                        ProgressEventDetailResponse(e.id, e.eventType, e.entityId, e.payload, e.createdAt.toString).toJson
                      }.toVector)
                      complete(StatusCodes.OK, jsonEntity(arr.compactPrint))
                    case Failure(ex) =>
                      errorResponse(StatusCodes.BadRequest, "PROGRESS_ERROR", ex.getMessage)
                  }
                }
              },
              path("stats") {
                get {
                  val stats = ProgressStatsResponse(
                    currentStreak = 14,
                    longestStreak = 21,
                    weeklyHoursLogged = 8.0,
                    weeklyHoursTarget = 14.0,
                    overallProgressPercent = 38.0
                  )
                  complete(StatusCodes.OK, jsonEntity(stats.toJson.compactPrint))
                }
              },
              path("events") {
                concat(
                  get {
                    onComplete(progressService.getEvents(user.id)) {
                      case Success(events) =>
                        val arr = JsArray(events.map { e =>
                          ProgressEventDetailResponse(e.id, e.eventType, e.entityId, e.payload, e.createdAt.toString).toJson
                        }.toVector)
                        complete(StatusCodes.OK, jsonEntity(arr.compactPrint))
                      case Failure(ex) =>
                        errorResponse(StatusCodes.BadRequest, "PROGRESS_ERROR", ex.getMessage)
                    }
                  },
                  post {
                    entity(as[String]) { jsonStr =>
                      Try(jsonStr.parseJson.convertTo[ProgressEventRequest]) match {
                        case Failure(ex) =>
                          errorResponse(StatusCodes.BadRequest, "INVALID_JSON", s"Invalid event payload: ${ex.getMessage}")
                        case Success(req) =>
                          onComplete(progressService.recordEvent(user.id, req)) {
                            case Success(event) =>
                              val resp = JsObject(
                                "id" -> JsString(event.id),
                                "status" -> JsString("recorded"),
                                "event_type" -> JsString(event.eventType)
                              )
                              complete(StatusCodes.OK, jsonEntity(resp.compactPrint))
                            case Failure(ex) =>
                              errorResponse(StatusCodes.BadRequest, "EVENT_FAILED", ex.getMessage)
                          }
                      }
                    }
                  }
                )
              }
            )
          case _ =>
            errorResponse(StatusCodes.Unauthorized, "UNAUTHORIZED", "Invalid authentication token.")
        }
      }
    }
  }
}
