package com.hades.controllers

import org.apache.pekko.http.scaladsl.model.{ContentTypes, HttpEntity, StatusCodes}
import org.apache.pekko.http.scaladsl.server.Directives._
import org.apache.pekko.http.scaladsl.server.Route
import com.hades.clients.AuthClient
import com.hades.errors._
import com.hades.errors.ApiErrorProtocol._
import com.hades.schemas.LearningPathJsonProtocol._
import com.hades.schemas.LearningPathRequest
import com.hades.services.LearningPathService
import com.hades.validation.RequestValidator
import spray.json._

import scala.concurrent.ExecutionContext
import scala.util.{Failure, Success, Try}

class LearningPathController(
  learningPathService: LearningPathService,
  authClient: AuthClient = null
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

  val route: Route = pathPrefix("api" / "learning-paths") {
    concat(
      pathEndOrSingleSlash {
        concat(
          get {
            optionalHeaderValueByName("Authorization") { authHeaderOpt =>
              optionalHeaderValueByName("X-User-Id") { customHeaderOpt =>
                val token = authHeaderOpt.orElse(customHeaderOpt).getOrElse("dev-user-1")
                val authFut = if (authClient != null) authClient.authenticate(token) else scala.concurrent.Future.successful(None)
                onComplete(authFut) {
                  case Success(Some(user)) =>
                    onComplete(learningPathService.getUserLearningPath(user.id)) {
                      case Success(Some(pathResp)) =>
                        complete(StatusCodes.OK, jsonEntity(pathResp.toJson.compactPrint))
                      case Success(None) =>
                        errorResponse(StatusCodes.NotFound, "NOT_FOUND", "No active learning path found.")
                      case Failure(ex) =>
                        errorResponse(StatusCodes.InternalServerError, "INTERNAL_ERROR", ex.getMessage)
                    }
                  case _ =>
                    errorResponse(StatusCodes.Unauthorized, "UNAUTHORIZED", "Invalid authentication token.")
                }
              }
            }
          },
          post {
            optionalHeaderValueByName("Authorization") { authHeaderOpt =>
              optionalHeaderValueByName("X-User-Id") { customHeaderOpt =>
                val token = authHeaderOpt.orElse(customHeaderOpt).getOrElse("dev-user-1")
                val authFut = if (authClient != null) authClient.authenticate(token) else scala.concurrent.Future.successful(None)
                onComplete(authFut) {
                  case Success(userOpt) =>
                    val userId = userOpt.map(_.id).getOrElse("dev-user-1")
                    entity(as[String]) { jsonString =>
                      if (jsonString.trim.nonEmpty) {
                        Try(jsonString.parseJson.convertTo[LearningPathRequest]) match {
                          case Failure(ex) =>
                            errorResponse(StatusCodes.BadRequest, "INVALID_JSON", s"Invalid JSON payload: ${ex.getMessage}")

                          case Success(request) =>
                            RequestValidator.validate(request) match {
                              case Left(valError) =>
                                errorResponse(StatusCodes.BadRequest, "VALIDATION_ERROR", valError.getMessage)

                              case Right(validRequest) =>
                                onComplete(learningPathService.generateAndPersistLearningPath(userId, validRequest)) {
                                  case Success(response) =>
                                    complete(StatusCodes.OK, jsonEntity(response.toJson.compactPrint))

                                  case Failure(ex: AiServiceUnavailableException) =>
                                    errorResponse(StatusCodes.ServiceUnavailable, "AI_SERVICE_UNAVAILABLE", ex.getMessage)

                                  case Failure(ex: AiServiceException) =>
                                    errorResponse(StatusCodes.BadGateway, "AI_SERVICE_ERROR", ex.getMessage)

                                  case Failure(ex: ValidationException) =>
                                    errorResponse(StatusCodes.BadRequest, "VALIDATION_ERROR", ex.getMessage)

                                  case Failure(ex) =>
                                    errorResponse(StatusCodes.InternalServerError, "INTERNAL_SERVER_ERROR", s"An unexpected error occurred: ${ex.getMessage}")
                                }
                            }
                        }
                      } else {
                        onComplete(learningPathService.generateLearningPathForUser(userId)) {
                          case Success(response) =>
                            complete(StatusCodes.OK, jsonEntity(response.toJson.compactPrint))
                          case Failure(ex: AiServiceUnavailableException) =>
                            errorResponse(StatusCodes.ServiceUnavailable, "AI_SERVICE_UNAVAILABLE", ex.getMessage)
                          case Failure(ex: AiServiceException) =>
                            errorResponse(StatusCodes.BadGateway, "AI_SERVICE_ERROR", ex.getMessage)
                          case Failure(ex: ValidationException) =>
                            errorResponse(StatusCodes.BadRequest, "VALIDATION_ERROR", ex.getMessage)
                          case Failure(ex) =>
                            errorResponse(StatusCodes.InternalServerError, "INTERNAL_SERVER_ERROR", s"An unexpected error occurred: ${ex.getMessage}")
                        }
                      }
                    }
                  case _ =>
                    errorResponse(StatusCodes.Unauthorized, "UNAUTHORIZED", "Invalid authentication token.")
                }
              }
            }
          }
        )
      },
      path("history") {
        get {
          optionalHeaderValueByName("Authorization") { authHeaderOpt =>
            optionalHeaderValueByName("X-User-Id") { customHeaderOpt =>
              val token = authHeaderOpt.orElse(customHeaderOpt).getOrElse("dev-user-1")
              val authFut = if (authClient != null) authClient.authenticate(token) else scala.concurrent.Future.successful(None)
              onComplete(authFut) {
                case Success(Some(user)) =>
                  onComplete(learningPathService.getUserLearningPaths(user.id)) {
                    case Success(paths) =>
                      complete(StatusCodes.OK, jsonEntity(JsArray(paths.map(_.toJson).toVector).compactPrint))
                    case Failure(ex) =>
                      errorResponse(StatusCodes.InternalServerError, "INTERNAL_ERROR", ex.getMessage)
                  }
                case _ =>
                  errorResponse(StatusCodes.Unauthorized, "UNAUTHORIZED", "Invalid authentication token.")
              }
            }
          }
        }
      },
      path(Segment) { id =>
        get {
          onComplete(learningPathService.getLearningPathById(id)) {
            case Success(Some(pathResp)) =>
              complete(StatusCodes.OK, jsonEntity(pathResp.toJson.compactPrint))
            case Success(None) =>
              errorResponse(StatusCodes.NotFound, "NOT_FOUND", s"Learning path with ID '$id' not found.")
            case Failure(ex) =>
              errorResponse(StatusCodes.InternalServerError, "INTERNAL_ERROR", ex.getMessage)
          }
        }
      }
    )
  }
}
