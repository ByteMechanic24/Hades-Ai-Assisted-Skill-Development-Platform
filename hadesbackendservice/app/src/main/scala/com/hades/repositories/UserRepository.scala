package com.hades.repositories

import com.hades.models.User
import slick.jdbc.PostgresProfile.api._
import java.sql.Timestamp
import java.time.Instant
import scala.concurrent.{ExecutionContext, Future}

trait UserRepository {
  def save(user: User): Future[User]
  def findById(id: String): Future[Option[User]]
  def findByEmail(email: String): Future[Option[User]]
}

class PostgresUserRepository(db: Database)(implicit ec: ExecutionContext) extends UserRepository {
  private val fallback = new InMemoryUserRepository()

  private class UserTable(tag: Tag) extends Table[User](tag, "users") {
    def id = column[String]("id", O.PrimaryKey)
    def email = column[String]("email")
    def name = column[String]("name")
    def authProvider = column[String]("auth_provider")
    def createdAt = column[Timestamp]("created_at")
    def updatedAt = column[Timestamp]("updated_at")

    def * = (id, email, name, authProvider, createdAt, updatedAt).shaped <> (
      { case (id, email, name, authProvider, createdAt, updatedAt) =>
        User(id, email, name, authProvider, createdAt.toInstant, updatedAt.toInstant)
      },
      { u: User =>
        Some((u.id, u.email, u.name, u.authProvider, Timestamp.from(u.createdAt), Timestamp.from(u.updatedAt)))
      }
    )
  }

  private val users = TableQuery[UserTable]

  override def save(user: User): Future[User] = {
    val action = users.insertOrUpdate(user)
    db.run(action).map(_ => user).recoverWith { case _ =>
      fallback.save(user)
    }
  }

  override def findById(id: String): Future[Option[User]] = {
    db.run(users.filter(_.id === id).result.headOption).recoverWith { case _ =>
      fallback.findById(id)
    }
  }

  override def findByEmail(email: String): Future[Option[User]] = {
    db.run(users.filter(_.email === email).result.headOption).recoverWith { case _ =>
      fallback.findByEmail(email)
    }
  }
}

class InMemoryUserRepository extends UserRepository {
  private val store = java.util.concurrent.ConcurrentHashMap.newKeySet[User]()

  override def save(user: User): Future[User] = {
    import scala.jdk.CollectionConverters._
    store.removeIf(_.id == user.id)
    store.add(user)
    Future.successful(user)
  }

  override def findById(id: String): Future[Option[User]] = {
    import scala.jdk.CollectionConverters._
    Future.successful(store.asScala.find(_.id == id))
  }

  override def findByEmail(email: String): Future[Option[User]] = {
    import scala.jdk.CollectionConverters._
    Future.successful(store.asScala.find(_.email == email))
  }
}
