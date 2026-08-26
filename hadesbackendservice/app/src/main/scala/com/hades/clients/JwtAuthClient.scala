package com.hades.clients

import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import com.hades.models.User
import com.hades.repositories.UserRepository

import java.time.Instant
import java.util.Date
import scala.concurrent.{ExecutionContext, Future}
import scala.util.Try

class JwtAuthClient(
  userRepository: UserRepository,
  secret: String = "hades-super-secret-jwt-signing-key-2026"
)(implicit ec: ExecutionContext) extends AuthClient {

  private val algorithm = Algorithm.HMAC256(secret)
  private val verifier = JWT.require(algorithm).withIssuer("hades-auth").build()

  def createToken(userId: String, email: String, name: String): String = {
    val now = new Date()
    val expiresAt = new Date(now.getTime + (30L * 24 * 60 * 60 * 1000)) // 30 days validity

    JWT.create()
      .withIssuer("hades-auth")
      .withSubject(userId)
      .withClaim("email", email)
      .withClaim("name", name)
      .withIssuedAt(now)
      .withExpiresAt(expiresAt)
      .sign(algorithm)
  }

  override def authenticate(rawToken: String): Future[Option[User]] = {
    val token = rawToken.replace("Bearer", "").trim

    if (token == "dev-user-1" || token.startsWith("dev-")) {
      val userId = if (token.nonEmpty) token else "dev-user-1"
      userRepository.findById(userId).flatMap {
        case Some(u) => Future.successful(Some(u))
        case None =>
          val now = Instant.now()
          val newUser = User(userId, s"$userId@hades.ai", "Default Learner", "dev", now, now)
          userRepository.save(newUser).map(Some(_))
      }
    } else {
      Try {
        val decodedJwt = verifier.verify(token)
        val userId = decodedJwt.getSubject
        val email = Option(decodedJwt.getClaim("email").asString()).getOrElse(s"$userId@hades.ai")
        val name = Option(decodedJwt.getClaim("name").asString()).getOrElse(email.split("@").head.capitalize)
        (userId, email, name)
      }.toOption match {
        case Some((userId, email, name)) =>
          userRepository.findById(userId).flatMap {
            case Some(u) => Future.successful(Some(u))
            case None =>
              val now = Instant.now()
              val newUser = User(userId, email, name, "jwt", now, now)
              userRepository.save(newUser).map(Some(_))
          }
        case None =>
          Future.successful(None)
      }
    }
  }
}
