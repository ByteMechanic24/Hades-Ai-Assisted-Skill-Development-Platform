package com.hades.services

import com.hades.models.{LearningPathNode, SkillProgress}
import com.hades.repositories.{LearningPathRepository, ProgressRepository}

import scala.concurrent.{ExecutionContext, Future}

case class PrerequisiteCheckResult(
  nodeId: String,
  unlocked: Boolean,
  missingPrerequisiteNodeIds: Seq[String],
  missingSkillIds: Seq[String]
)

trait PrerequisiteService {
  def checkNodeUnlock(userId: String, pathId: String, nodeId: String): Future[PrerequisiteCheckResult]
}

class PrerequisiteServiceImpl(
  learningPathRepository: LearningPathRepository,
  progressRepository: ProgressRepository
)(implicit ec: ExecutionContext) extends PrerequisiteService {

  override def checkNodeUnlock(userId: String, pathId: String, nodeId: String): Future[PrerequisiteCheckResult] = {
    for {
      nodes <- learningPathRepository.findNodesByPathId(pathId)
      targetNodeOpt = nodes.find(_.nodeId == nodeId)
      skillProgresses <- progressRepository.findSkillProgressByUser(userId)
    } yield {
      targetNodeOpt match {
        case None =>
          PrerequisiteCheckResult(nodeId, unlocked = false, missingPrerequisiteNodeIds = Nil, missingSkillIds = Nil)

        case Some(targetNode) =>
          val completedNodeIds = nodes.filter(_.status == "completed").map(_.nodeId).toSet
          val missingNodes = targetNode.prerequisiteIds.filterNot(completedNodeIds.contains)

          val userSkillConfMap = skillProgresses.map(sp => sp.skillId -> sp.confidence).toMap
          val missingSkills = targetNode.skillIds.filter { sId =>
            userSkillConfMap.getOrElse(sId, 0.0) < 0.5
          }

          val unlocked = missingNodes.isEmpty && missingSkills.isEmpty
          PrerequisiteCheckResult(nodeId, unlocked, missingNodes, missingSkills)
      }
    }
  }
}
