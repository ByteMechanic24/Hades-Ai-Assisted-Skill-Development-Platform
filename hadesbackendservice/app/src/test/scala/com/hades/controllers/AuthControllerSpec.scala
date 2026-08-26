package com.hades.controllers

import org.apache.pekko.http.scaladsl.model._
import org.apache.pekko.http.scaladsl.testkit.ScalatestRouteTest
import com.hades.clients.JwtAuthClient
import com.hades.repositories._
import org.junit.runner.RunWith
import org.scalatest.matchers.should.Matchers
import org.scalatest.wordspec.AnyWordSpec
import org.scalatestplus.junit.JUnitRunner

@RunWith(classOf[JUnitRunner])
class AuthControllerSpec extends AnyWordSpec with Matchers with ScalatestRouteTest {

  private val userRepo = new InMemoryUserRepository()
  private val profileRepo = new InMemoryLearnerProfileRepository()
  private val learningPathRepo = new InMemoryLearningPathRepository()
  private val jwtAuthClient = new JwtAuthClient(userRepo)

  private val authController = new AuthController(userRepo, profileRepo, learningPathRepo, jwtAuthClient)

  "AuthController" should {

    "return 201 Created for POST /api/v1/auth/sign-up with new user" in {
      val signUpJson =
        """{
          |  "name": "Aman Kumar",
          |  "email": "aman@hades.ai",
          |  "password": "securepassword123"
          |}""".stripMargin

      Post("/api/v1/auth/sign-up", HttpEntity(ContentTypes.`application/json`, signUpJson)) ~> authController.route ~> check {
        status shouldBe StatusCodes.Created
        contentType shouldBe ContentTypes.`application/json`
        val body = responseAs[String]
        body should include("token")
        body should include("aman@hades.ai")
        body should include("\"has_generated_roadmap\":false")
      }
    }

    "return 200 OK for POST /api/v1/auth/sign-in with existing user" in {
      val signInJson =
        """{
          |  "email": "aman@hades.ai",
          |  "password": "securepassword123"
          |}""".stripMargin

      Post("/api/v1/auth/sign-in", HttpEntity(ContentTypes.`application/json`, signInJson)) ~> authController.route ~> check {
        status shouldBe StatusCodes.OK
        contentType shouldBe ContentTypes.`application/json`
        val body = responseAs[String]
        body should include("token")
        body should include("aman@hades.ai")
      }
    }

    "return 200 OK for POST /api/v1/auth/oauth-login with OAuth token" in {
      val oauthJson =
        """{
          |  "provider": "google",
          |  "providerToken": "mock-google-oauth-token-123",
          |  "email": "aman.oauth@hades.ai",
          |  "name": "Aman OAuth User"
          |}""".stripMargin

      Post("/api/v1/auth/oauth-login", HttpEntity(ContentTypes.`application/json`, oauthJson)) ~> authController.route ~> check {
        status shouldBe StatusCodes.OK
        contentType shouldBe ContentTypes.`application/json`
        val body = responseAs[String]
        body should include("token")
        body should include("aman.oauth@hades.ai")
      }
    }

    "return 400 Bad Request for POST /api/v1/auth/sign-in with invalid JSON" in {
      Post("/api/v1/auth/sign-in", HttpEntity(ContentTypes.`application/json`, "{ invalid_json: ")) ~> authController.route ~> check {
        status shouldBe StatusCodes.BadRequest
        val body = responseAs[String]
        body should include("INVALID_JSON")
      }
    }
  }
}
