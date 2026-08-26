package com.hades.config

import com.typesafe.config.{Config, ConfigFactory}

case class DatabaseConfig(
  driver: String,
  url: String,
  user: String,
  password: String,
  numThreads: Int,
  maxConnections: Int
)

case class AppConfig(
  aiServiceBaseUrl: String,
  httpInterface: String,
  httpPort: Int,
  jwtSecret: String,
  googleClientId: String,
  googleClientSecret: String,
  database: DatabaseConfig
)

object AppConfig {
  def load(): AppConfig = load(ConfigFactory.load())

  def load(config: Config): AppConfig = {
    AppConfig(
      aiServiceBaseUrl = config.getString("ai-service.base-url"),
      httpInterface = config.getString("http.interface"),
      httpPort = config.getInt("http.port"),
      jwtSecret = if (config.hasPath("jwt.secret")) config.getString("jwt.secret") else "hades-super-secret-jwt-signing-key-2026",
      googleClientId = if (config.hasPath("oauth.google.client-id")) config.getString("oauth.google.client-id") else "1053667687662-gr9tddp9th9nce87ff8o7fqrefbhnqcf.apps.googleusercontent.com",
      googleClientSecret = if (config.hasPath("oauth.google.client-secret")) config.getString("oauth.google.client-secret") else "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",
      database = DatabaseConfig(
        driver = config.getString("database.driver"),
        url = config.getString("database.url"),
        user = config.getString("database.user"),
        password = config.getString("database.password"),
        numThreads = config.getInt("database.numThreads"),
        maxConnections = config.getInt("database.maxConnections")
      )
    )
  }
}

