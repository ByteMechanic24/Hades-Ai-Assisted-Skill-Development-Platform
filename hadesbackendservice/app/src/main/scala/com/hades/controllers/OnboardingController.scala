package com.hades.controllers

import org.apache.pekko.http.scaladsl.model.{ContentTypes, HttpEntity, StatusCodes}
import org.apache.pekko.http.scaladsl.server.Directives._
import org.apache.pekko.http.scaladsl.server.Route
import com.hades.clients.AuthClient
import com.hades.errors.ApiErrorProtocol._
import com.hades.errors._
import com.hades.schemas.ApiJsonProtocol._
import com.hades.schemas.{OnboardingRequest, ProfileResponse}
import com.hades.services.OnboardingService
import spray.json._
import scala.concurrent.ExecutionContext
import scala.util.{Failure, Success, Try}

class OnboardingController(
  authClient: AuthClient,
  onboardingService: OnboardingService
)(implicit ec: ExecutionContext) {

  private def jsonEntity(jsonString: String): HttpEntity.Strict =
    HttpEntity(ContentTypes.`application/json`, jsonString)

  private def errorResponse(status: StatusCodes.ClientError, code: String, message: String): Route = {
    val errJson = ApiErrorResponse(ErrorDetails(code, message)).toJson.compactPrint
    complete(status, jsonEntity(errJson))
  }

  val route: Route = path("api" / "onboarding") {
    post {
      optionalHeaderValueByName("Authorization") { authHeaderOpt =>
        optionalHeaderValueByName("X-User-Id") { customHeaderOpt =>
          val token = authHeaderOpt.orElse(customHeaderOpt).getOrElse("dev-user-1")
          onComplete(authClient.authenticate(token)) {
            case Success(Some(user)) =>
              entity(as[String]) { jsonStr =>
                Try(jsonStr.parseJson.convertTo[OnboardingRequest]) match {
                  case Failure(ex) =>
                    errorResponse(StatusCodes.BadRequest, "INVALID_JSON", s"Invalid onboarding payload: ${ex.getMessage}")
                  case Success(req) =>
                    onComplete(onboardingService.processOnboarding(user.id, req)) {
                      case Success((p, _)) =>
                        val resp = ProfileResponse(user.id, p.experienceLevel, p.minutesPerDay, p.daysPerWeek, p.targetRole, p.learningPreferences)
                        complete(StatusCodes.OK, jsonEntity(resp.toJson.compactPrint))
                      case Failure(ex) =>
                        errorResponse(StatusCodes.BadRequest, "ONBOARDING_FAILED", ex.getMessage)
                    }
                }
              }
            case _ =>
              errorResponse(StatusCodes.Unauthorized, "UNAUTHORIZED", "Invalid authentication token.")
          }
        }
      }
    }
  }
}
