package com.hades.controllers

import org.apache.pekko.http.scaladsl.model.{ContentTypes, HttpEntity, StatusCodes}
import org.apache.pekko.http.scaladsl.server.Directives._
import org.apache.pekko.http.scaladsl.server.Route
import com.hades.clients.AuthClient
import com.hades.errors.ApiErrorProtocol._
import com.hades.errors._
import com.hades.schemas.ApiJsonProtocol._
import com.hades.services.DashboardService
import spray.json._
import scala.concurrent.ExecutionContext
import scala.util.{Failure, Success}

class DashboardController(
  authClient: AuthClient,
  dashboardService: DashboardService
)(implicit ec: ExecutionContext) {

  private def jsonEntity(jsonString: String): HttpEntity.Strict =
    HttpEntity(ContentTypes.`application/json`, jsonString)

  private def errorResponse(status: StatusCodes.ClientError, code: String, message: String): Route = {
    val errJson = ApiErrorResponse(ErrorDetails(code, message)).toJson.compactPrint
    complete(status, jsonEntity(errJson))
  }

  val route: Route = path("api" / "dashboard") {
    get {
      optionalHeaderValueByName("Authorization") { authHeaderOpt =>
        optionalHeaderValueByName("X-User-Id") { customHeaderOpt =>
          val token = authHeaderOpt.orElse(customHeaderOpt).getOrElse("dev-user-1")
          onComplete(authClient.authenticate(token)) {
            case Success(Some(user)) =>
              onComplete(dashboardService.getDashboard(user.id)) {
                case Success(dashboard) =>
                  complete(StatusCodes.OK, jsonEntity(dashboard.toJson.compactPrint))
                case Failure(ex) =>
                  errorResponse(StatusCodes.BadRequest, "DASHBOARD_ERROR", ex.getMessage)
              }
            case _ =>
              errorResponse(StatusCodes.Unauthorized, "UNAUTHORIZED", "Invalid token.")
          }
        }
      }
    }
  }
}
