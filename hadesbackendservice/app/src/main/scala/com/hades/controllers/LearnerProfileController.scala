package com.hades.controllers

import org.apache.pekko.http.scaladsl.model.{ContentTypes, HttpEntity, StatusCodes}
import org.apache.pekko.http.scaladsl.server.Directives._
import org.apache.pekko.http.scaladsl.server.Route
import com.hades.clients.AuthClient
import com.hades.errors.ApiErrorProtocol._
import com.hades.errors._
import com.hades.schemas.ApiJsonProtocol._
import com.hades.schemas.{ProfileResponse, ProfileUpdateRequest}
import com.hades.services.LearnerProfileService
import spray.json._
import scala.concurrent.ExecutionContext
import scala.util.{Failure, Success, Try}

class LearnerProfileController(
  authClient: AuthClient,
  profileService: LearnerProfileService
)(implicit ec: ExecutionContext) {

  private def jsonEntity(jsonString: String): HttpEntity.Strict =
    HttpEntity(ContentTypes.`application/json`, jsonString)

  private def errorResponse(status: StatusCodes.ClientError, code: String, message: String): Route = {
    val errJson = ApiErrorResponse(ErrorDetails(code, message)).toJson.compactPrint
    complete(status, jsonEntity(errJson))
  }

  val route: Route = pathPrefix("api" / "profile") {
    optionalHeaderValueByName("Authorization") { authHeaderOpt =>
      optionalHeaderValueByName("X-User-Id") { customUserHeaderOpt =>
        val token = authHeaderOpt.orElse(customUserHeaderOpt).getOrElse("dev-user-1")
        onComplete(authClient.authenticate(token)) {
          case Success(Some(user)) =>
            concat(
              get {
                onComplete(profileService.getProfile(user.id)) {
                  case Success(p) =>
                    val resp = ProfileResponse(user.id, p.experienceLevel, p.minutesPerDay, p.daysPerWeek, p.targetRole, p.learningPreferences)
                    complete(StatusCodes.OK, jsonEntity(resp.toJson.compactPrint))
                  case Failure(ex) =>
                    errorResponse(StatusCodes.BadRequest, "PROFILE_ERROR", ex.getMessage)
                }
              },
              put {
                entity(as[String]) { jsonStr =>
                  Try(jsonStr.parseJson.convertTo[ProfileUpdateRequest]) match {
                    case Failure(ex) =>
                      errorResponse(StatusCodes.BadRequest, "INVALID_JSON", s"Invalid profile payload: ${ex.getMessage}")
                    case Success(req) =>
                      onComplete(profileService.updateProfile(user.id, req)) {
                        case Success(p) =>
                          val resp = ProfileResponse(user.id, p.experienceLevel, p.minutesPerDay, p.daysPerWeek, p.targetRole, p.learningPreferences)
                          complete(StatusCodes.OK, jsonEntity(resp.toJson.compactPrint))
                        case Failure(ex) =>
                          errorResponse(StatusCodes.BadRequest, "UPDATE_FAILED", ex.getMessage)
                      }
                  }
                }
              }
            )
          case _ =>
            errorResponse(StatusCodes.Unauthorized, "UNAUTHORIZED", "Invalid or missing authentication token.")
        }
      }
    }
  }
}
