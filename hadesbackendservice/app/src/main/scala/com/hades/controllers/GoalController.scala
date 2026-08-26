package com.hades.controllers

import org.apache.pekko.http.scaladsl.model.{ContentTypes, HttpEntity, StatusCodes}
import org.apache.pekko.http.scaladsl.server.Directives._
import org.apache.pekko.http.scaladsl.server.Route
import com.hades.clients.AuthClient
import com.hades.errors.ApiErrorProtocol._
import com.hades.errors._
import com.hades.schemas.ApiJsonProtocol._
import com.hades.schemas.{GoalCreateRequest, GoalResponse}
import com.hades.services.GoalService
import spray.json._
import scala.concurrent.ExecutionContext
import scala.util.{Failure, Success, Try}

class GoalController(
  authClient: AuthClient,
  goalService: GoalService
)(implicit ec: ExecutionContext) {

  private def jsonEntity(jsonString: String): HttpEntity.Strict =
    HttpEntity(ContentTypes.`application/json`, jsonString)

  private def errorResponse(status: StatusCodes.ClientError, code: String, message: String): Route = {
    val errJson = ApiErrorResponse(ErrorDetails(code, message)).toJson.compactPrint
    complete(status, jsonEntity(errJson))
  }

  val route: Route = pathPrefix("api" / "goals") {
    optionalHeaderValueByName("Authorization") { authHeaderOpt =>
      optionalHeaderValueByName("X-User-Id") { customHeaderOpt =>
        val token = authHeaderOpt.orElse(customHeaderOpt).getOrElse("dev-user-1")
        onComplete(authClient.authenticate(token)) {
          case Success(Some(user)) =>
            concat(
              get {
                onComplete(goalService.getActiveLearningGoal(user.id)) {
                  case Success(Some(g)) =>
                    val resp = GoalResponse(g.id, g.title, g.description, g.isActive)
                    complete(StatusCodes.OK, jsonEntity(resp.toJson.compactPrint))
                  case Success(None) =>
                    errorResponse(StatusCodes.NotFound, "NOT_FOUND", "No active goal found.")
                  case Failure(ex) =>
                    errorResponse(StatusCodes.BadRequest, "GOAL_ERROR", ex.getMessage)
                }
              },
              post {
                entity(as[String]) { jsonStr =>
                  Try(jsonStr.parseJson.convertTo[GoalCreateRequest]) match {
                    case Failure(ex) =>
                      errorResponse(StatusCodes.BadRequest, "INVALID_JSON", s"Invalid goal payload: ${ex.getMessage}")
                    case Success(req) =>
                      onComplete(goalService.createLearningGoal(user.id, req)) {
                        case Success(g) =>
                          val resp = GoalResponse(g.id, g.title, g.description, g.isActive)
                          complete(StatusCodes.OK, jsonEntity(resp.toJson.compactPrint))
                        case Failure(ex) =>
                          errorResponse(StatusCodes.BadRequest, "CREATE_FAILED", ex.getMessage)
                      }
                  }
                }
              }
            )
          case _ =>
            errorResponse(StatusCodes.Unauthorized, "UNAUTHORIZED", "Invalid authentication token.")
        }
      }
    }
  }
}
