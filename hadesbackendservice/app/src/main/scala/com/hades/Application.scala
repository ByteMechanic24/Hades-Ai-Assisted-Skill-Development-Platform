package com.hades

import org.apache.pekko.actor.typed.ActorSystem
import org.apache.pekko.actor.typed.scaladsl.Behaviors
import org.apache.pekko.http.scaladsl.Http
import com.hades.clients._
import com.hades.config.AppConfig
import com.hades.controllers._
import com.hades.database.DatabaseManager
import com.hades.hadesapi.Routes
import com.hades.repositories._
import com.hades.services._
import org.slf4j.LoggerFactory

import scala.util.{Failure, Success}

object Application {

  private val logger = LoggerFactory.getLogger(Application.getClass)

  def main(args: Array[String]): Unit = {
    implicit val system: ActorSystem[Nothing] = ActorSystem(Behaviors.empty, "hades-backend")
    implicit val ec = system.executionContext

    val config = AppConfig.load()

    logger.info("Starting HADES Backend Modular Monolith...")
    logger.info(s"Configured AI Service Base URL: ${config.aiServiceBaseUrl}")

    // Database & Flyway
    val dbManager = new DatabaseManager(config.database)
    dbManager.runMigrations()

    // Repositories
    val userRepo = new PostgresUserRepository(dbManager.db)
    val profileRepo = new PostgresLearnerProfileRepository(dbManager.db)
    val interestRepo = new PostgresInterestRepository(dbManager.db)
    val careerGoalRepo = new PostgresCareerGoalRepository(dbManager.db)
    val learningGoalRepo = new PostgresLearningGoalRepository(dbManager.db)
    val riasecRepo = new PostgresRiasecRepository(dbManager.db)
    val skillRepo = new PostgresSkillRepository(dbManager.db)
    val learningPathRepo = new PostgresLearningPathRepository(dbManager.db)
    val resourceRepo = new PostgresResourceRepository(dbManager.db)
    val progressRepo = new PostgresProgressRepository(dbManager.db)
    val assessmentRepo = new PostgresAssessmentRepository(dbManager.db)
    val milestoneRepo = new PostgresMilestoneRepository(dbManager.db)
    val eventRepo = new PostgresEventRepository(dbManager.db)
    val recommendationRepo = new PostgresRecommendationRepository(dbManager.db)

    // Clients
    val jwtAuthClient = new JwtAuthClient(userRepo, config.jwtSecret)
    val authClient: AuthClient = jwtAuthClient
    val aiServiceClient = new HttpAiServiceClient(config.aiServiceBaseUrl)

    // Services
    val learnerProfileService = new LearnerProfileServiceImpl(profileRepo)
    val goalService = new GoalServiceImpl(learningGoalRepo, careerGoalRepo)
    val onboardingService = new OnboardingServiceImpl(learnerProfileService, goalService, interestRepo)
    val riasecService = new RiasecServiceImpl(riasecRepo)
    val skillService = new SkillServiceImpl(skillRepo, progressRepo)
    val resourceService = new ResourceServiceImpl(resourceRepo)
    val milestoneService = new MilestoneServiceImpl(milestoneRepo, learningPathRepo, assessmentRepo)
    val progressService = new ProgressServiceImpl(eventRepo, progressRepo, learningPathRepo, milestoneService)
    val assessmentService = new AssessmentServiceImpl(assessmentRepo, progressRepo)
    val recommendationService = new RecommendationServiceImpl(recommendationRepo, resourceRepo, profileRepo)

    val dashboardService = new DashboardServiceImpl(
      userRepo, profileRepo, interestRepo, careerGoalRepo, learningGoalRepo, riasecRepo,
      learningPathRepo, progressRepo, milestoneRepo, eventRepo, recommendationService
    )

    val learningPathService = new LearningPathServiceImpl(
      aiServiceClient, dashboardService, learningPathRepo, skillRepo
    )

    val assistantService = new AssistantServiceImpl(dashboardService, aiServiceClient)

    // Controllers
    val authController = new AuthController(userRepo, profileRepo, learningPathRepo, jwtAuthClient)
    val learningPathController = new LearningPathController(learningPathService, authClient)
    val learnerProfileController = new LearnerProfileController(authClient, learnerProfileService)
    val onboardingController = new OnboardingController(authClient, onboardingService)
    val riasecController = new RiasecController(authClient, riasecService)
    val goalController = new GoalController(authClient, goalService)
    val skillController = new SkillController(authClient, skillService)
    val resourceController = new ResourceController(resourceService)
    val progressController = new ProgressController(authClient, progressService)
    val assessmentController = new AssessmentController(authClient, assessmentService)
    val milestoneController = new MilestoneController(authClient, milestoneRepo, learningPathRepo)
    val recommendationController = new RecommendationController(authClient, recommendationService)
    val dashboardController = new DashboardController(authClient, dashboardService)
    val assistantController = new AssistantController(authClient, assistantService)

    val routes = new Routes(
      learningPathController,
      learnerProfileController,
      onboardingController,
      riasecController,
      goalController,
      skillController,
      resourceController,
      progressController,
      assessmentController,
      milestoneController,
      recommendationController,
      dashboardController,
      assistantController,
      authController
    )

    Http()
      .newServerAt(config.httpInterface, config.httpPort)
      .bind(routes.routes)
      .onComplete {
        case Success(binding) =>
          val address = binding.localAddress
          logger.info(s"HADES Backend online at http://${address.getHostString}:${address.getPort}/")
        case Failure(ex) =>
          logger.error("Failed to bind HTTP endpoint, terminating system", ex)
          system.terminate()
      }
  }
}
