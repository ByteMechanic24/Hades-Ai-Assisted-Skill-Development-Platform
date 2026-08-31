package com.hades.controllers

import org.apache.pekko.http.scaladsl.model.{ContentTypes, HttpEntity, StatusCodes}
import org.apache.pekko.http.scaladsl.server.Directives._
import org.apache.pekko.http.scaladsl.server.Route
import com.hades.clients.JwtAuthClient
import com.hades.errors.ApiErrorProtocol._
import com.hades.errors._
import com.hades.models.{LearnerProfile, User}
import com.hades.repositories.{LearnerProfileRepository, LearningPathRepository, UserRepository}
import com.hades.schemas.AuthJsonProtocol._
import com.hades.schemas._
import spray.json._

import java.time.Instant
import java.util.UUID
import scala.concurrent.ExecutionContext
import scala.util.{Failure, Success, Try}

class AuthController(
  userRepo: UserRepository,
  profileRepo: LearnerProfileRepository,
  learningPathRepo: LearningPathRepository,
  jwtAuthClient: JwtAuthClient
)(implicit ec: ExecutionContext) {

  private def jsonEntity(jsonString: String): HttpEntity.Strict =
    HttpEntity(ContentTypes.`application/json`, jsonString)

  private def errorResponse(status: StatusCodes.ClientError, code: String, message: String): Route = {
    val errJson = ApiErrorResponse(ErrorDetails(code, message)).toJson.compactPrint
    complete(status, jsonEntity(errJson))
  }

  private val defaultAvatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"

  private def handleSignIn(req: SignInRequest): Route = {
    onComplete(userRepo.findByEmail(req.email)) {
      case Success(Some(user)) =>
        onComplete(learningPathRepo.findActiveByUserId(user.id)) {
          case Success(activePathOpt) =>
            val hasGeneratedRoadmap = activePathOpt.isDefined
            val token = jwtAuthClient.createToken(user.id, user.email, user.name)
            val resp = AuthResponse(
              token = token,
              user = AuthUserResponse(user.id, user.name, user.email, defaultAvatar, hasGeneratedRoadmap)
            )
            complete(StatusCodes.OK, jsonEntity(resp.toJson.compactPrint))
          case Failure(ex) =>
            errorResponse(StatusCodes.BadRequest, "AUTH_ERROR", ex.getMessage)
        }
      case Success(None) =>
        errorResponse(StatusCodes.Unauthorized, "INVALID_CREDENTIALS", "No account found with this email. Please sign up first.")
      case Failure(ex) =>
        errorResponse(StatusCodes.BadRequest, "AUTH_ERROR", ex.getMessage)
    }
  }

  private def handleSignUp(req: SignUpRequest): Route = {
    onComplete(userRepo.findByEmail(req.email)) {
      case Success(Some(existingUser)) =>
        onComplete(learningPathRepo.findActiveByUserId(existingUser.id)) {
          case Success(pathOpt) =>
            val token = jwtAuthClient.createToken(existingUser.id, existingUser.email, existingUser.name)
            val resp = AuthResponse(token, AuthUserResponse(existingUser.id, existingUser.name, existingUser.email, defaultAvatar, pathOpt.isDefined))
            complete(StatusCodes.OK, jsonEntity(resp.toJson.compactPrint))
          case Failure(ex) =>
            errorResponse(StatusCodes.BadRequest, "AUTH_ERROR", ex.getMessage)
        }
      case _ =>
        val userId = s"user_${UUID.randomUUID().toString.take(8)}"
        val now = Instant.now()
        val newUser = User(userId, req.email, req.name, "email", now, now)
        val newProfile = LearnerProfile(userId, "beginner", 60, 5, "Machine Learning Engineer", Seq("hands_on", "video"))

        val saveFut = for {
          savedUser <- userRepo.save(newUser)
          _ <- profileRepo.save(newProfile)
        } yield savedUser

        onComplete(saveFut) {
          case Success(u) =>
            val token = jwtAuthClient.createToken(u.id, u.email, u.name)
            val resp = AuthResponse(token, AuthUserResponse(u.id, u.name, u.email, defaultAvatar, false))
            complete(StatusCodes.Created, jsonEntity(resp.toJson.compactPrint))
          case Failure(ex) =>
            errorResponse(StatusCodes.BadRequest, "SIGN_UP_FAILED", ex.getMessage)
        }
    }
  }

  private def handleOAuthLogin(req: OAuthLoginRequest): Route = {
    val email = req.email.getOrElse(s"user-${req.provider}@hades.ai")
    val name = req.name.getOrElse(s"${req.provider.capitalize} Learner")

    onComplete(userRepo.findByEmail(email)) {
      case Success(Some(existingUser)) =>
        onComplete(learningPathRepo.findActiveByUserId(existingUser.id)) {
          case Success(pathOpt) =>
            val token = jwtAuthClient.createToken(existingUser.id, existingUser.email, existingUser.name)
            val resp = AuthResponse(token, AuthUserResponse(existingUser.id, existingUser.name, existingUser.email, defaultAvatar, pathOpt.isDefined))
            complete(StatusCodes.OK, jsonEntity(resp.toJson.compactPrint))
          case Failure(ex) =>
            errorResponse(StatusCodes.BadRequest, "OAUTH_FAILED", ex.getMessage)
        }
      case _ =>
        val userId = s"oauth_${req.provider}_${UUID.randomUUID().toString.take(8)}"
        val now = Instant.now()
        val newUser = User(userId, email, name, req.provider, now, now)
        val newProfile = LearnerProfile(userId, "intermediate", 60, 5, "Autonomous AI Systems Engineer", Seq("hands_on", "project_based"))

        val saveFut = for {
          u <- userRepo.save(newUser)
          _ <- profileRepo.save(newProfile)
        } yield u

        onComplete(saveFut) {
          case Success(u) =>
            val token = jwtAuthClient.createToken(u.id, u.email, u.name)
            val resp = AuthResponse(token, AuthUserResponse(u.id, u.name, u.email, defaultAvatar, false))
            complete(StatusCodes.OK, jsonEntity(resp.toJson.compactPrint))
          case Failure(ex) =>
            errorResponse(StatusCodes.BadRequest, "OAUTH_FAILED", ex.getMessage)
        }
    }
  }

  val route: Route = pathPrefix("api" / ("v1" / "auth" | "auth")) {
    concat(
      path("sign-in") {
        post {
          entity(as[String]) { jsonStr =>
            Try(jsonStr.parseJson.convertTo[SignInRequest]) match {
              case Success(req) => handleSignIn(req)
              case Failure(ex) => errorResponse(StatusCodes.BadRequest, "INVALID_JSON", ex.getMessage)
            }
          }
        }
      },
      path("sign-up") {
        post {
          entity(as[String]) { jsonStr =>
            Try(jsonStr.parseJson.convertTo[SignUpRequest]) match {
              case Success(req) => handleSignUp(req)
              case Failure(ex) => errorResponse(StatusCodes.BadRequest, "INVALID_JSON", ex.getMessage)
            }
          }
        }
      },
      path("oauth-login") {
        post {
          entity(as[String]) { jsonStr =>
            Try(jsonStr.parseJson.convertTo[OAuthLoginRequest]) match {
              case Success(req) => handleOAuthLogin(req)
              case Failure(ex) => errorResponse(StatusCodes.BadRequest, "INVALID_JSON", ex.getMessage)
            }
          }
        }
      }
    )
  }
}
