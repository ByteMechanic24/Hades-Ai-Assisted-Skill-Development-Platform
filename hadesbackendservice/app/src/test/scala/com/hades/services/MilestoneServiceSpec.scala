package com.hades.services

import com.hades.models.{AssessmentResult, LearningPath, LearningPathNode, Milestone}
import com.hades.repositories.{InMemoryAssessmentRepository, InMemoryLearningPathRepository, InMemoryMilestoneRepository}
import org.junit.runner.RunWith
import org.scalatest.concurrent.ScalaFutures
import org.scalatest.matchers.should.Matchers
import org.scalatest.wordspec.AnyWordSpec
import org.scalatestplus.junit.JUnitRunner

import scala.concurrent.ExecutionContext.Implicits.global

@RunWith(classOf[JUnitRunner])
class MilestoneServiceSpec extends AnyWordSpec with Matchers with ScalaFutures {

  "MilestoneService" should {

    "evaluate milestone as completed when required nodes are complete and assessment score is satisfied" in {
      val milestoneRepo = new InMemoryMilestoneRepository()
      val pathRepo = new InMemoryLearningPathRepository()
      val assessmentRepo = new InMemoryAssessmentRepository()

      val service = new MilestoneServiceImpl(milestoneRepo, pathRepo, assessmentRepo)

      val path = LearningPath("p1", "u1", "", "Path 1", "Desc", 50)
      val node1 = LearningPathNode("id1", "p1", "n1", "Node 1", "Desc", 10, 1, "completed")
      val milestone = Milestone("m1", "p1", "Foundations Milestone", Seq("n1"), 70.0)
      val assessmentResult = AssessmentResult("r1", "u1", "a1", 85.0, passed = true)

      pathRepo.saveTransactional(path, Seq(node1), Seq(milestone)).futureValue
      milestoneRepo.saveMilestones(Seq(milestone)).futureValue
      assessmentRepo.saveResult(assessmentResult).futureValue

      val userMilestones = service.evaluateUserMilestones("u1", "p1").futureValue
      userMilestones should have size 1
      userMilestones.head.status shouldBe "completed"
    }

    "evaluate milestone as in_progress when required node is not complete" in {
      val milestoneRepo = new InMemoryMilestoneRepository()
      val pathRepo = new InMemoryLearningPathRepository()
      val assessmentRepo = new InMemoryAssessmentRepository()

      val service = new MilestoneServiceImpl(milestoneRepo, pathRepo, assessmentRepo)

      val path = LearningPath("p1", "u1", "", "Path 1", "Desc", 50)
      val node1 = LearningPathNode("id1", "p1", "n1", "Node 1", "Desc", 10, 1, "in_progress")
      val milestone = Milestone("m1", "p1", "Foundations Milestone", Seq("n1"), 70.0)

      pathRepo.saveTransactional(path, Seq(node1), Seq(milestone)).futureValue
      milestoneRepo.saveMilestones(Seq(milestone)).futureValue

      val userMilestones = service.evaluateUserMilestones("u1", "p1").futureValue
      userMilestones should have size 1
      userMilestones.head.status shouldBe "in_progress"
    }
  }
}
