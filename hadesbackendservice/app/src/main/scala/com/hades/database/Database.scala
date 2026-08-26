package com.hades.database

import com.hades.config.DatabaseConfig
import org.flywaydb.core.Flyway
import org.slf4j.LoggerFactory
import slick.jdbc.PostgresProfile.api._

import scala.util.Try

class DatabaseManager(val config: DatabaseConfig) {
  private val logger = LoggerFactory.getLogger(classOf[DatabaseManager])

  def runMigrations(): Try[Int] = Try {
    logger.info(s"Running Flyway migrations on DB URL: ${config.url}")
    val flyway = Flyway.configure()
      .dataSource(config.url, config.user, config.password)
      .baselineOnMigrate(true)
      .load()
    val result = flyway.migrate()
    logger.info(s"Flyway migration completed successfully. Executed ${result.migrationsExecuted} migrations.")
    result.migrationsExecuted
  }.recover { case ex: Throwable =>
    logger.warn(s"Flyway migration failed or database unreachable (${ex.getMessage}). Skipping auto-migration.")
    0
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
