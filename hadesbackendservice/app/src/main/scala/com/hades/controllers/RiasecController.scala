package com.hades.controllers

import org.apache.pekko.http.scaladsl.model.{ContentTypes, HttpEntity, StatusCodes}
import org.apache.pekko.http.scaladsl.server.Directives._
import org.apache.pekko.http.scaladsl.server.Route
import com.hades.clients.AuthClient
import com.hades.errors.ApiErrorProtocol._
import com.hades.errors._
import com.hades.schemas.ApiJsonProtocol._
import com.hades.schemas.RiasecRequest
import com.hades.services.RiasecService
import spray.json._
import scala.concurrent.ExecutionContext
import scala.util.{Failure, Success, Try}

class RiasecController(
  authClient: AuthClient,
  riasecService: RiasecService
)(implicit ec: ExecutionContext) {

  private def jsonEntity(jsonString: String): HttpEntity.Strict =
    HttpEntity(ContentTypes.`application/json`, jsonString)

  private def errorResponse(status: StatusCodes.ClientError, code: String, message: String): Route = {
    val errJson = ApiErrorResponse(ErrorDetails(code, message)).toJson.compactPrint
    complete(status, jsonEntity(errJson))
  }

  val route: Route = pathPrefix("api" / "riasec") {
    optionalHeaderValueByName("Authorization") { authHeaderOpt =>
      optionalHeaderValueByName("X-User-Id") { customHeaderOpt =>
        val token = authHeaderOpt.orElse(customHeaderOpt).getOrElse("dev-user-1")
        onComplete(authClient.authenticate(token)) {
          case Success(Some(user)) =>
            concat(
              get {
                onComplete(riasecService.getResult(user.id)) {
                  case Success(Some(res)) =>
                    val req = RiasecRequest(res.realistic, res.investigative, res.artistic, res.social, res.enterprising, res.conventional)
                    complete(StatusCodes.OK, jsonEntity(req.toJson.compactPrint))
                  case Success(None) =>
                    errorResponse(StatusCodes.NotFound, "NOT_FOUND", "RIASEC result not found.")
                  case Failure(ex) =>
                    errorResponse(StatusCodes.BadRequest, "RIASEC_ERROR", ex.getMessage)
                }
              },
              post {
                entity(as[String]) { jsonStr =>
                  Try(jsonStr.parseJson.convertTo[RiasecRequest]) match {
                    case Failure(ex) =>
                      errorResponse(StatusCodes.BadRequest, "INVALID_JSON", s"Invalid RIASEC payload: ${ex.getMessage}")
                    case Success(req) =>
                      onComplete(riasecService.saveResult(user.id, req)) {
                        case Success(_) =>
                          complete(StatusCodes.OK, jsonEntity(req.toJson.compactPrint))
                        case Failure(ex) =>
                          errorResponse(StatusCodes.BadRequest, "SAVE_FAILED", ex.getMessage)
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
