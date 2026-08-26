package com.hades.clients

import com.hades.models.User
import com.hades.repositories.UserRepository

import scala.concurrent.{ExecutionContext, Future}

trait AuthClient {
  def authenticate(tokenOrHeader: String): Future[Option[User]]
}

class DevAuthClient(userRepository: UserRepository)(implicit ec: ExecutionContext) extends AuthClient {
  
  private val defaultDevUser = User(
    id = "dev-user-1",
    email = "dev@hades.ai",
    name = "Default Learner",
    authProvider = "dev"
  )

  override def authenticate(tokenOrHeader: String): Future[Option[User]] = {
    val cleanToken = tokenOrHeader.stripPrefix("Bearer ").trim
    val userId = if (cleanToken.nonEmpty) cleanToken else "dev-user-1"

    userRepository.findById(userId).flatMap {
      case Some(user) => Future.successful(Some(user))
      case None =>
        val newUser = defaultDevUser.copy(id = userId)
        userRepository.save(newUser).map(Some(_))
    }
  }
}
