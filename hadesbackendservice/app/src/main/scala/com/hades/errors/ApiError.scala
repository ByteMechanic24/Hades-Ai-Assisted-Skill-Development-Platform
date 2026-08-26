package com.hades.errors

import spray.json.{DefaultJsonProtocol, RootJsonFormat}

case class ErrorDetails(
  code: String,
  message: String
)

case class ApiErrorResponse(
  error: ErrorDetails
)

object ApiErrorProtocol extends DefaultJsonProtocol {
  implicit val errorDetailsFormat: RootJsonFormat[ErrorDetails] = jsonFormat2(ErrorDetails)
  implicit val apiErrorResponseFormat: RootJsonFormat[ApiErrorResponse] = jsonFormat1(ApiErrorResponse)
}

class AiServiceUnavailableException(message: String, cause: Throwable = null)
  extends RuntimeException(message, cause)

class AiServiceException(val statusCode: Int, message: String)
  extends RuntimeException(message)

class ValidationException(message: String)
  extends RuntimeException(message)
