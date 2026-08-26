package com.hades.services

import com.hades.models.{LearnerProfile, LearningGoal, User}
import com.hades.repositories._
import org.junit.runner.RunWith
import org.scalatest.concurrent.ScalaFutures
import org.scalatest.matchers.should.Matchers
import org.scalatest.wordspec.AnyWordSpec
import org.scalatestplus.junit.JUnitRunner

import scala.concurrent.ExecutionContext.Implicits.global

@RunWith(classOf[JUnitRunner])
class DashboardServiceSpec extends AnyWordSpec with Matchers with ScalaFutures {

  "DashboardService" should {

    "aggregate user learner state into DashboardResponse" in {
      val userRepo = new InMemoryUserRepository()
      val profileRepo = new InMemoryLearnerProfileRepository()
      val interestRepo = new InMemoryInterestRepository()
      val careerGoalRepo = new InMemoryCareerGoalRepository()
      val learningGoalRepo = new InMemoryLearningGoalRepository()
      val riasecRepo = new InMemoryRiasecRepository()
      val pathRepo = new InMemoryLearningPathRepository()
      val progressRepo = new InMemoryProgressRepository()
      val milestoneRepo = new InMemoryMilestoneRepository()
      val eventRepo = new InMemoryEventRepository()
      val recRepo = new InMemoryRecommendationRepository()
      val resourceRepo = new InMemoryResourceRepository()

      val recService = new RecommendationServiceImpl(recRepo, resourceRepo, profileRepo)

      val service = new DashboardServiceImpl(
        userRepo, profileRepo, interestRepo, careerGoalRepo, learningGoalRepo,
        riasecRepo, pathRepo, progressRepo, milestoneRepo, eventRepo, recService
      )

      userRepo.save(User("u1", "u1@hades.ai", "Learner One")).futureValue
      profileRepo.save(LearnerProfile("u1", experienceLevel = "intermediate", targetRole = "Data Scientist")).futureValue
      learningGoalRepo.save(LearningGoal("g1", "u1", "Master Data Science", "Complete DS roadmap")).futureValue

      val dashboard = service.getDashboard("u1").futureValue

      dashboard.user.userId shouldBe "u1"
      dashboard.user.experienceLevel shouldBe "intermediate"
      dashboard.user.targetRole shouldBe "Data Scientist"
      dashboard.activeGoal.get.title shouldBe "Master Data Science"
    }
  }
}
