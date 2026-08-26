package com.hades.controllers

import org.apache.pekko.http.scaladsl.model.{ContentTypes, HttpEntity, StatusCodes}
import org.apache.pekko.http.scaladsl.server.Directives._
import org.apache.pekko.http.scaladsl.server.Route
import com.hades.errors.ApiErrorProtocol._
import com.hades.errors._
import com.hades.services.ResourceService
import spray.json._
import scala.concurrent.ExecutionContext
import scala.util.{Failure, Success}

class ResourceController(resourceService: ResourceService)(implicit ec: ExecutionContext) {

  private def jsonEntity(jsonString: String): HttpEntity.Strict =
    HttpEntity(ContentTypes.`application/json`, jsonString)

  private def errorResponse(status: StatusCodes.ClientError, code: String, message: String): Route = {
    val errJson = ApiErrorResponse(ErrorDetails(code, message)).toJson.compactPrint
    complete(status, jsonEntity(errJson))
  }

  val route: Route = pathPrefix("api" / "resources") {
    concat(
      pathEndOrSingleSlash {
        get {
          onComplete(resourceService.listResources()) {
            case Success(resList) =>
              val array = JsArray(resList.map { r =>
                JsObject(
                  "id" -> JsString(r.id),
                  "title" -> JsString(r.title),
                  "url" -> JsString(r.url),
                  "provider" -> JsString(r.provider),
                  "difficulty" -> JsString(r.difficulty),
                  "duration_minutes" -> JsNumber(r.durationMinutes)
                )
              }.toVector)
              complete(StatusCodes.OK, jsonEntity(array.compactPrint))
            case Failure(ex) =>
              errorResponse(StatusCodes.BadRequest, "RESOURCE_ERROR", ex.getMessage)
          }
        }
      },
      path(Segment) { id =>
        get {
          onComplete(resourceService.getResource(id)) {
            case Success(Some(r)) =>
              val obj = JsObject(
                "id" -> JsString(r.id),
                "title" -> JsString(r.title),
                "url" -> JsString(r.url),
                "provider" -> JsString(r.provider),
                "description" -> JsString(r.description),
                "difficulty" -> JsString(r.difficulty),
                "duration_minutes" -> JsNumber(r.durationMinutes)
              )
              complete(StatusCodes.OK, jsonEntity(obj.compactPrint))
            case Success(None) =>
              errorResponse(StatusCodes.NotFound, "NOT_FOUND", s"Resource '$id' not found.")
            case Failure(ex) =>
              errorResponse(StatusCodes.BadRequest, "RESOURCE_ERROR", ex.getMessage)
          }
        }
      }
    )
  }
}
