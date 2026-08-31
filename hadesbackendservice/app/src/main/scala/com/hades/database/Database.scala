package com.hades.database

import com.hades.config.DatabaseConfig
import org.flywaydb.core.Flyway
import org.slf4j.LoggerFactory
import slick.jdbc.PostgresProfile.api._

import scala.util.Try

class DatabaseManager(val config: DatabaseConfig) {
  private val logger = LoggerFactory.getLogger(classOf[DatabaseManager])

  def runMigrations(): Try[Int] = {
    try {
      logger.info(s"Running Flyway migrations on DB URL: ${config.url}")
      val flyway = Flyway.configure()
        .dataSource(config.url, config.user, config.password)
        .baselineOnMigrate(true)
        .baselineVersion("0")
        .load()
      val result = flyway.migrate()
      logger.info(s"Flyway migration completed successfully. Executed ${result.migrationsExecuted} migrations.")
      scala.util.Success(result.migrationsExecuted)
    } catch {
      case t: Throwable =>
        logger.warn(s"Flyway migration encountered issue or was skipped (${t.getMessage}). Continuing application initialization.")
        scala.util.Success(0)
    }
  }

  val db: Database = {
    Database.forURL(
      url = config.url,
      user = config.user,
      password = config.password,
      driver = config.driver,
      executor = AsyncExecutor("hades-db-executor", numThreads = config.numThreads, queueSize = 1000)
    )
  }

  def close(): Unit = {
    db.close()
  }
}
