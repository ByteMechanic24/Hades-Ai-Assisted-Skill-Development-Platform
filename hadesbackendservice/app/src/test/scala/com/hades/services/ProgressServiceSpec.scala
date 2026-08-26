package com.hades.services

import com.hades.models.{LearningPath, LearningPathNode, Milestone}
import com.hades.repositories._
import com.hades.schemas.ProgressEventRequest
import org.junit.runner.RunWith
import org.scalatest.concurrent.ScalaFutures
import org.scalatest.matchers.should.Matchers
import org.scalatest.wordspec.AnyWordSpec
import org.scalatestplus.junit.JUnitRunner

import scala.concurrent.ExecutionContext.Implicits.global

@RunWith(classOf[JUnitRunner])
class ProgressServiceSpec extends AnyWordSpec with Matchers with ScalaFutures {

  "ProgressService" should {

    "record RESOURCE_COMPLETED event and update resource progress state" in {
      val eventRepo = new InMemoryEventRepository()
      val progressRepo = new InMemoryProgressRepository()
      val pathRepo = new InMemoryLearningPathRepository()
      val milestoneRepo = new InMemoryMilestoneRepository()
      val assessmentRepo = new InMemoryAssessmentRepository()

      val milestoneService = new MilestoneServiceImpl(milestoneRepo, pathRepo, assessmentRepo)
      val service = new ProgressServiceImpl(eventRepo, progressRepo, pathRepo, milestoneService)

      val req = ProgressEventRequest("RESOURCE_COMPLETED", "res-123", "{}")
      val event = service.recordEvent("user-1", req).futureValue

      event.eventType shouldBe "RESOURCE_COMPLETED"
      event.entityId shouldBe "res-123"

      val resProgressOpt = progressRepo.findResourceProgress("user-1", "res-123").futureValue
      resProgressOpt.isDefined shouldBe true
      resProgressOpt.get.status shouldBe "completed"
      resProgressOpt.get.progressPercent shouldBe 100.0
    }
  }
}
