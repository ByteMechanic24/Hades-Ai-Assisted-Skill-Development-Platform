package com.hades.validation

import com.hades.schemas._
import org.junit.runner.RunWith
import org.scalatest.matchers.should.Matchers
import org.scalatest.wordspec.AnyWordSpec
import org.scalatestplus.junit.JUnitRunner

@RunWith(classOf[JUnitRunner])
class AiResponseValidatorSpec extends AnyWordSpec with Matchers {

  private val validSkill = SkillResponse("python", "Python", "beginner")
  private val validNode1 = LearningPathNodeResponse("n1", "Python Basics", "Learn basics", Seq("python"), Nil, 10, 1)
  private val validNode2 = LearningPathNodeResponse("n2", "Advanced Python", "Learn advanced", Seq("python"), Seq("n1"), 15, 2)
  private val validMilestone = MilestoneResponse("m1", "Foundations Complete", Seq("n1"))

  "AiResponseValidator" should {

    "pass validation for a valid LearningPathResponse" in {
      val response = LearningPathResponse(
        title = "Python Path",
        description = "A valid path",
        estimatedHours = 25,
        skills = Seq(validSkill),
        nodes = Seq(validNode1, validNode2),
        milestones = Seq(validMilestone)
      )

      val result = AiResponseValidator.validate(response)
      result.isRight shouldBe true
    }

    "fail validation when title is empty" in {
      val response = LearningPathResponse(
        title = "",
        description = "Desc",
        estimatedHours = 10,
        skills = Seq(validSkill),
        nodes = Seq(validNode1),
        milestones = Seq(validMilestone)
      )

      val result = AiResponseValidator.validate(response)
      result.isLeft shouldBe true
      result.swap.getOrElse(fail("Expected Left")).getMessage should include("title must not be empty")
    }

    "fail validation when circular prerequisite dependency is present" in {
      val cycleNode1 = LearningPathNodeResponse("n1", "Node 1", "Desc", Seq("python"), Seq("n2"), 10, 1)
      val cycleNode2 = LearningPathNodeResponse("n2", "Node 2", "Desc", Seq("python"), Seq("n1"), 10, 2)

      val response = LearningPathResponse(
        title = "Circular Path",
        description = "Path with cycle",
        estimatedHours = 20,
        skills = Seq(validSkill),
        nodes = Seq(cycleNode1, cycleNode2),
        milestones = Seq(validMilestone)
      )

      val result = AiResponseValidator.validate(response)
      result.isLeft shouldBe true
      result.swap.getOrElse(fail("Expected Left")).getMessage should include("Circular prerequisite dependency detected")
    }

    "fail validation when a node references a missing skill" in {
      val invalidNode = LearningPathNodeResponse("n1", "Node 1", "Desc", Seq("non_existent_skill"), Nil, 10, 1)

      val response = LearningPathResponse(
        title = "Path",
        description = "Desc",
        estimatedHours = 10,
        skills = Seq(validSkill),
        nodes = Seq(invalidNode),
        milestones = Nil
      )

      val result = AiResponseValidator.validate(response)
      result.isLeft shouldBe true
      result.swap.getOrElse(fail("Expected Left")).getMessage should include("references missing skill")
    }
  }
}
