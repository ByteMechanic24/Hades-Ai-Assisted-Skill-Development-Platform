package com.hades.schemas

import spray.json._

case class SignInRequest(
  email: String,
  password: String
)

case class SignUpRequest(
  name: String,
  email: String,
  password: String
)

case class OAuthLoginRequest(
  provider: String,
  providerToken: String,
  email: Option[String] = None,
  name: Option[String] = None
)

case class AuthUserResponse(
  id: String,
  name: String,
  email: String,
  avatar: String,
  has_generated_roadmap: Boolean
)

case class AuthResponse(
  token: String,
  user: AuthUserResponse
)

object AuthJsonProtocol extends DefaultJsonProtocol {
  implicit val signInRequestFormat: RootJsonFormat[SignInRequest] = jsonFormat2(SignInRequest)
  implicit val signUpRequestFormat: RootJsonFormat[SignUpRequest] = jsonFormat3(SignUpRequest)
  implicit val oAuthLoginRequestFormat: RootJsonFormat[OAuthLoginRequest] = jsonFormat4(OAuthLoginRequest)
  implicit val authUserResponseFormat: RootJsonFormat[AuthUserResponse] = jsonFormat5(AuthUserResponse)
  implicit val authResponseFormat: RootJsonFormat[AuthResponse] = jsonFormat2(AuthResponse)
}
