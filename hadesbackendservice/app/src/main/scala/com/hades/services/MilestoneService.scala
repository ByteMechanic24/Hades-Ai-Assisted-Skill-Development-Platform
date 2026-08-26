package com.hades.services

import com.hades.models.{Milestone, UserMilestone}
import com.hades.repositories.{AssessmentRepository, LearningPathRepository, MilestoneRepository}
import java.time.Instant
import java.util.UUID
import scala.concurrent.{ExecutionContext, Future}

trait MilestoneService {
  def evaluateUserMilestones(userId: String, pathId: String): Future[Seq[UserMilestone]]
}

class MilestoneServiceImpl(
  milestoneRepository: MilestoneRepository,
  learningPathRepository: LearningPathRepository,
  assessmentRepository: AssessmentRepository
)(implicit ec: ExecutionContext) extends MilestoneService {

  override def evaluateUserMilestones(userId: String, pathId: String): Future[Seq[UserMilestone]] = {
    val resultFut = for {
      milestones <- milestoneRepository.findByPathId(pathId)
      nodes <- learningPathRepository.findNodesByPathId(pathId)
      results <- assessmentRepository.findResultsByUser(userId)
      existingUserMilestones <- milestoneRepository.findUserMilestones(userId)
    } yield {
      val completedNodeIds = nodes.filter(_.status == "completed").map(_.nodeId).toSet
      val maxAssessmentScore = if (results.isEmpty) 0.0 else results.map(_.score).max

      val updatedMilestoneFutures = milestones.map { m =>
        val existingUmOpt = existingUserMilestones.find(_.milestoneId == m.id)
        val allNodesCompleted = m.requiredNodeIds.forall(completedNodeIds.contains)
        val scoreSatisfied = maxAssessmentScore >= m.requiredScore

        val isCompleted = allNodesCompleted && scoreSatisfied
        val newStatus = if (isCompleted) "completed" else if (existingUmOpt.exists(_.status == "completed")) "completed" else "in_progress"

        val um = UserMilestone(
          id = existingUmOpt.map(_.id).getOrElse(UUID.randomUUID().toString),
          userId = userId,
          milestoneId = m.id,
          status = newStatus,
          completedAt = if (isCompleted) Some(Instant.now()) else existingUmOpt.flatMap(_.completedAt)
        )
        milestoneRepository.saveUserMilestone(um)
      }
      Future.sequence(updatedMilestoneFutures)
    }
    resultFut.flatMap(identity)
  }
}
