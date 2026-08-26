package com.hades.services

import com.hades.models.{Assessment, AssessmentQuestion}
import com.hades.repositories.{InMemoryAssessmentRepository, InMemoryProgressRepository}
import com.hades.schemas.AssessmentSubmitRequest
import org.junit.runner.RunWith
import org.scalatest.concurrent.ScalaFutures
import org.scalatest.matchers.should.Matchers
import org.scalatest.wordspec.AnyWordSpec
import org.scalatestplus.junit.JUnitRunner

import scala.concurrent.ExecutionContext.Implicits.global

@RunWith(classOf[JUnitRunner])
class AssessmentServiceSpec extends AnyWordSpec with Matchers with ScalaFutures {

  "AssessmentService" should {

    "correctly grade submitted assessment and update skill confidence" in {
      val assessmentRepo = new InMemoryAssessmentRepository()
      val progressRepo = new InMemoryProgressRepository()
      val service = new AssessmentServiceImpl(assessmentRepo, progressRepo)

      val assessment = Assessment("a1", "Python Quiz", "python", passingScore = 70)
      val q1 = AssessmentQuestion("q1", "a1", "What is 2+2?", Seq("3", "4", "5"), 1)
      val q2 = AssessmentQuestion("q2", "a1", "Is Python dynamically typed?", Seq("Yes", "No"), 0)

      assessmentRepo.saveAssessment(assessment, Seq(q1, q2)).futureValue

      val req = AssessmentSubmitRequest(Map("q1" -> 1, "q2" -> 0))
      val response = service.submitAssessment("u1", "a1", req).futureValue

      response.score shouldBe 100.0
      response.passed shouldBe true

      val skillProgressOpt = progressRepo.findSkillProgress("u1", "python").futureValue
      skillProgressOpt.isDefined shouldBe true
      skillProgressOpt.get.confidence shouldBe 1.0
    }
  }
}
