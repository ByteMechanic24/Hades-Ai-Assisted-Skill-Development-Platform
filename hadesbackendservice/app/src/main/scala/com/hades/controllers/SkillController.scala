package com.hades.controllers

import org.apache.pekko.http.scaladsl.model.{ContentTypes, HttpEntity, StatusCodes}
import org.apache.pekko.http.scaladsl.server.Directives._
import org.apache.pekko.http.scaladsl.server.Route
import com.hades.clients.AuthClient
import com.hades.errors.ApiErrorProtocol._
import com.hades.errors._
import com.hades.schemas.LearningPathJsonProtocol._
import com.hades.schemas.SkillResponse
import com.hades.services.SkillService
import spray.json._
import scala.concurrent.ExecutionContext
import scala.util.{Failure, Success}

class SkillController(
  authClient: AuthClient,
  skillService: SkillService
)(implicit ec: ExecutionContext) {

  private def jsonEntity(jsonString: String): HttpEntity.Strict =
    HttpEntity(ContentTypes.`application/json`, jsonString)

  private def errorResponse(status: StatusCodes.ClientError, code: String, message: String): Route = {
    val errJson = ApiErrorResponse(ErrorDetails(code, message)).toJson.compactPrint
    complete(status, jsonEntity(errJson))
  }

  val route: Route = pathPrefix("api" / "skills") {
    concat(
      pathEndOrSingleSlash {
        get {
          onComplete(skillService.listSkills()) {
            case Success(skills) =>
              val resp = skills.map(s => SkillResponse(s.id, s.name, s.difficulty))
              val jsonStr = JsArray(resp.map(_.toJson).toVector).compactPrint
              complete(StatusCodes.OK, jsonEntity(jsonStr))
            case Failure(ex) =>
              errorResponse(StatusCodes.BadRequest, "SKILL_ERROR", ex.getMessage)
          }
        }
      },
      path(Segment / "progress") { skillId =>
        get {
          optionalHeaderValueByName("Authorization") { authHeaderOpt =>
            optionalHeaderValueByName("X-User-Id") { customHeaderOpt =>
              val token = authHeaderOpt.orElse(customHeaderOpt).getOrElse("dev-user-1")
              onComplete(authClient.authenticate(token)) {
                case Success(Some(user)) =>
                  onComplete(skillService.getSkillProgress(user.id, skillId)) {
                    case Success(Some(sp)) =>
                      val json = JsObject("skill_id" -> JsString(sp.skillId), "progress" -> JsNumber(sp.progress), "confidence" -> JsNumber(sp.confidence))
                      complete(StatusCodes.OK, jsonEntity(json.compactPrint))
                    case Success(None) =>
                      val json = JsObject("skill_id" -> JsString(skillId), "progress" -> JsNumber(0.0), "confidence" -> JsNumber(0.0))
                      complete(StatusCodes.OK, jsonEntity(json.compactPrint))
                    case Failure(ex) =>
                      errorResponse(StatusCodes.BadRequest, "PROGRESS_ERROR", ex.getMessage)
                  }
                case _ =>
                  errorResponse(StatusCodes.Unauthorized, "UNAUTHORIZED", "Invalid token.")
              }
            }
          }
        }
      },
      path(Segment) { id =>
        get {
          onComplete(skillService.getSkill(id)) {
            case Success(Some(s)) =>
              val resp = SkillResponse(s.id, s.name, s.difficulty)
              complete(StatusCodes.OK, jsonEntity(resp.toJson.compactPrint))
            case Success(None) =>
              errorResponse(StatusCodes.NotFound, "NOT_FOUND", s"Skill '$id' not found.")
            case Failure(ex) =>
              errorResponse(StatusCodes.BadRequest, "SKILL_ERROR", ex.getMessage)
          }
        }
      }
    )
  }
}
