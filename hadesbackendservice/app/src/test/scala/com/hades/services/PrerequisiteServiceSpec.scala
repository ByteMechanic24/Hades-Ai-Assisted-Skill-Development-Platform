package com.hades.services

import com.hades.models.{LearningPath, LearningPathNode}
import com.hades.repositories.{InMemoryLearningPathRepository, InMemoryProgressRepository}
import org.junit.runner.RunWith
import org.scalatest.concurrent.ScalaFutures
import org.scalatest.matchers.should.Matchers
import org.scalatest.wordspec.AnyWordSpec
import org.scalatestplus.junit.JUnitRunner

import scala.concurrent.ExecutionContext.Implicits.global

@RunWith(classOf[JUnitRunner])
class PrerequisiteServiceSpec extends AnyWordSpec with Matchers with ScalaFutures {

  "PrerequisiteService" should {

    "correctly identify unlocked node when prerequisites are completed" in {
      val pathRepo = new InMemoryLearningPathRepository()
      val progressRepo = new InMemoryProgressRepository()
      val service = new PrerequisiteServiceImpl(pathRepo, progressRepo)

      val path = LearningPath("p1", "u1", "", "Title", "Desc", 100)
      val node1 = LearningPathNode("id1", "p1", "n1", "Node 1", "Desc", 10, 1, "completed")
      val node2 = LearningPathNode("id2", "p1", "n2", "Node 2", "Desc", 10, 2, "locked", Nil, Seq("n1"))

      pathRepo.saveTransactional(path, Seq(node1, node2), Nil).futureValue

      val result = service.checkNodeUnlock("u1", "p1", "n2").futureValue
      result.unlocked shouldBe true
      result.missingPrerequisiteNodeIds shouldBe empty
    }

    "correctly flag locked node when prerequisite node is not completed" in {
      val pathRepo = new InMemoryLearningPathRepository()
      val progressRepo = new InMemoryProgressRepository()
      val service = new PrerequisiteServiceImpl(pathRepo, progressRepo)

      val path = LearningPath("p1", "u1", "", "Title", "Desc", 100)
      val node1 = LearningPathNode("id1", "p1", "n1", "Node 1", "Desc", 10, 1, "in_progress")
      val node2 = LearningPathNode("id2", "p1", "n2", "Node 2", "Desc", 10, 2, "locked", Nil, Seq("n1"))

      pathRepo.saveTransactional(path, Seq(node1, node2), Nil).futureValue

      val result = service.checkNodeUnlock("u1", "p1", "n2").futureValue
      result.unlocked shouldBe false
      result.missingPrerequisiteNodeIds should contain("n1")
    }
  }
}
