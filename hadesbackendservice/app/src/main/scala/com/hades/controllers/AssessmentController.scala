package com.hades.controllers

import org.apache.pekko.http.scaladsl.model.{ContentTypes, HttpEntity, StatusCodes}
import org.apache.pekko.http.scaladsl.server.Directives._
import org.apache.pekko.http.scaladsl.server.Route
import com.hades.clients.AuthClient
import com.hades.errors.ApiErrorProtocol._
import com.hades.errors._
import com.hades.schemas.ApiJsonProtocol._
import com.hades.schemas.AssessmentSubmitRequest
import com.hades.services.AssessmentService
import spray.json._
import scala.concurrent.ExecutionContext
import scala.util.{Failure, Success, Try}

class AssessmentController(
  authClient: AuthClient,
  assessmentService: AssessmentService
)(implicit ec: ExecutionContext) {

  private def jsonEntity(jsonString: String): HttpEntity.Strict =
    HttpEntity(ContentTypes.`application/json`, jsonString)

  private def errorResponse(status: StatusCodes.ClientError, code: String, message: String): Route = {
    val errJson = ApiErrorResponse(ErrorDetails(code, message)).toJson.compactPrint
    complete(status, jsonEntity(errJson))
  }

  val route: Route = pathPrefix("api" / "assessments") {
    pathPrefix(Segment) { id =>
      concat(
        pathEndOrSingleSlash {
          get {
            onComplete(assessmentService.getAssessment(id)) {
              case Success(Some((assessment, questions))) =>
                val qArray = JsArray(questions.map { q =>
                  JsObject(
                    "id" -> JsString(q.id),
                    "question_text" -> JsString(q.questionText),
                    "options" -> JsArray(q.options.map(JsString(_)).toVector)
                  )
                }.toVector)
                val resp = JsObject(
                  "id" -> JsString(assessment.id),
                  "title" -> JsString(assessment.title),
                  "passing_score" -> JsNumber(assessment.passingScore),
                  "questions" -> qArray
                )
                complete(StatusCodes.OK, jsonEntity(resp.compactPrint))
              case Success(None) =>
                errorResponse(StatusCodes.NotFound, "NOT_FOUND", s"Assessment '$id' not found.")
              case Failure(ex) =>
                errorResponse(StatusCodes.BadRequest, "ASSESSMENT_ERROR", ex.getMessage)
            }
          }
        },
        path("submit") {
          post {
            optionalHeaderValueByName("Authorization") { authHeaderOpt =>
              optionalHeaderValueByName("X-User-Id") { customHeaderOpt =>
                val token = authHeaderOpt.orElse(customHeaderOpt).getOrElse("dev-user-1")
                onComplete(authClient.authenticate(token)) {
                  case Success(Some(user)) =>
                    entity(as[String]) { jsonStr =>
                      Try(jsonStr.parseJson.convertTo[AssessmentSubmitRequest]) match {
                        case Failure(ex) =>
                          errorResponse(StatusCodes.BadRequest, "INVALID_JSON", s"Invalid submission payload: ${ex.getMessage}")
                        case Success(req) =>
                          onComplete(assessmentService.submitAssessment(user.id, id, req)) {
                            case Success(result) =>
                              complete(StatusCodes.OK, jsonEntity(result.toJson.compactPrint))
                            case Failure(ex) =>
                              errorResponse(StatusCodes.BadRequest, "SUBMIT_FAILED", ex.getMessage)
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
      )
    }
  }
}
