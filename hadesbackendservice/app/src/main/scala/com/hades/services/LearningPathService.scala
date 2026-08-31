package com.hades.services

import com.hades.clients.AiServiceClient
import com.hades.models.{LearningPath, LearningPathNode, Milestone}
import com.hades.repositories._
import com.hades.schemas._
import com.hades.schemas.LearningPathJsonProtocol._
import com.hades.validation.AiResponseValidator
import spray.json._
import java.util.UUID
import scala.concurrent.{ExecutionContext, Future}
import scala.util.Try

trait LearningPathService {
  def generateLearningPath(request: LearningPathRequest): Future[LearningPathResponse]
  def generateAndPersistLearningPath(userId: String, request: LearningPathRequest): Future[LearningPathResponse]
  def generateLearningPathForUser(userId: String): Future[LearningPathResponse]
  def getUserLearningPath(userId: String): Future[Option[LearningPathResponse]]
  def getUserLearningPaths(userId: String): Future[Seq[LearningPathResponse]]
  def getLearningPathById(id: String): Future[Option[LearningPathResponse]]
}

class LearningPathServiceImpl(
  aiServiceClient: AiServiceClient,
  dashboardService: DashboardService = null,
  learningPathRepository: LearningPathRepository = null,
  skillRepository: SkillRepository = null
)(implicit ec: ExecutionContext) extends LearningPathService {

  override def generateLearningPath(request: LearningPathRequest): Future[LearningPathResponse] = {
    aiServiceClient.generateLearningPath(request).flatMap { response =>
      AiResponseValidator.validate(response) match {
        case Left(valErr) => Future.failed(valErr)
        case Right(validResponse) => Future.successful(validResponse)
      }
    }
  }

  override def generateAndPersistLearningPath(userId: String, request: LearningPathRequest): Future[LearningPathResponse] = {
    val enrichedRequestFut = if (dashboardService != null) {
      dashboardService.getDashboard(userId).map { d =>
        val targetRole = d.activeGoal.map(_.title).filter(_.trim.nonEmpty)
          .orElse(Option(d.user.targetRole).filter(_.trim.nonEmpty))
          .getOrElse("Machine Learning Engineer")
        request.copy(
          learner = request.learner.copy(
            career = CareerContext(targetRole)
          )
        )
      }.recover { case _ => request }
    } else {
      Future.successful(request)
    }

    enrichedRequestFut.flatMap { validRequest =>
      aiServiceClient.generateLearningPath(validRequest).flatMap { response =>
        AiResponseValidator.validate(response) match {
          case Left(valErr) => Future.failed(valErr)
          case Right(validResp) =>
            if (learningPathRepository != null) {
              val pathId = UUID.randomUUID().toString
              val lp = LearningPath(
                id = pathId,
                userId = userId,
                goalId = "",
                title = validResp.title,
                description = validResp.description,
                estimatedHours = validResp.estimatedHours,
                status = "active"
              )

              val nodes = validResp.nodes.zipWithIndex.map { case (n, idx) =>
                val resJson = if (n.resources.nonEmpty) JsArray(n.resources.map(_.toJson).toVector).compactPrint else "[]"
                LearningPathNode(
                  id = UUID.randomUUID().toString,
                  learningPathId = pathId,
                  nodeId = n.id,
                  title = n.title,
                  description = n.description,
                  estimatedHours = n.estimatedHours,
                  sequence = n.sequence,
                  status = if (idx == 0) "in_progress" else "locked",
                  skillIds = n.skillIds,
                  prerequisiteIds = n.prerequisiteIds,
                  resourcesJson = resJson
                )
              }

              val milestones = validResp.milestones.map { m =>
                Milestone(
                  id = UUID.randomUUID().toString,
                  learningPathId = pathId,
                  title = m.title,
                  requiredNodeIds = m.nodeIds,
                  requiredScore = 70.0
                )
              }

              learningPathRepository.saveTransactional(lp, nodes, milestones).map(_ => validResp)
            } else {
              Future.successful(validResp)
            }
        }
      }
    }
  }

  override def generateLearningPathForUser(userId: String): Future[LearningPathResponse] = {
    val req = LearningPathRequest(
      learner = LearnerContext(
        experienceLevel = "intermediate",
        interests = Seq("Artificial Intelligence", "Python"),
        career = CareerContext("Machine Learning Engineer"),
        learningPreferences = Seq("visual", "practical"),
        availability = LearningAvailability(
          minutesPerDay = 60,
          daysPerWeek = 5
        ),
        existingSkills = Seq(
          SkillConfidence("Python", 0.7),
          SkillConfidence("Algorithms", 0.8)
        ),
        completedLearning = Nil,
        riasec = None
      ),
      goal = LearningGoalRequest(
        title = "Machine Learning Engineer",
        description = "Master machine learning foundations and deep learning models."
      )
    )
    generateAndPersistLearningPath(userId, req)
  }

  override def getUserLearningPath(userId: String): Future[Option[LearningPathResponse]] = {
    if (learningPathRepository == null) Future.successful(None)
    else {
      learningPathRepository.findActiveByUserId(userId).flatMap {
        case None => Future.successful(None)
        case Some(lp) =>
          learningPathRepository.findNodesByPathId(lp.id).map { nodes =>
            val nodeResps = nodes.map { n =>
              val parsedResources = Try {
                if (n.resourcesJson != null && n.resourcesJson.trim.nonEmpty && n.resourcesJson != "[]") {
                  n.resourcesJson.parseJson.convertTo[Seq[NodeResourceResponse]]
                } else Nil
              }.getOrElse(Nil)

              LearningPathNodeResponse(
                id = n.nodeId,
                title = n.title,
                description = n.description,
                skillIds = n.skillIds,
                prerequisiteIds = n.prerequisiteIds,
                estimatedHours = n.estimatedHours,
                sequence = n.sequence,
                resources = parsedResources
              )
            }
            Some(LearningPathResponse(lp.title, lp.description, lp.estimatedHours, Nil, nodeResps, Nil))
          }
      }
    }
  }

  override def getUserLearningPaths(userId: String): Future[Seq[LearningPathResponse]] = {
    if (learningPathRepository == null) Future.successful(Nil)
    else {
      learningPathRepository.findAllByUserId(userId).flatMap { pathList =>
        val futures = pathList.map { lp =>
          learningPathRepository.findNodesByPathId(lp.id).map { nodes =>
            val nodeResps = nodes.map { n =>
              val parsedResources = Try {
                if (n.resourcesJson != null && n.resourcesJson.trim.nonEmpty && n.resourcesJson != "[]") {
                  n.resourcesJson.parseJson.convertTo[Seq[NodeResourceResponse]]
                } else Nil
              }.getOrElse(Nil)

              LearningPathNodeResponse(
                id = n.nodeId,
                title = n.title,
                description = n.description,
                skillIds = n.skillIds,
                prerequisiteIds = n.prerequisiteIds,
                estimatedHours = n.estimatedHours,
                sequence = n.sequence,
                resources = parsedResources
              )
            }
            LearningPathResponse(lp.title, lp.description, lp.estimatedHours, Nil, nodeResps, Nil)
          }
        }
        Future.sequence(futures)
      }
    }
  }

  override def getLearningPathById(id: String): Future[Option[LearningPathResponse]] = {
    if (learningPathRepository == null) Future.successful(None)
    else {
      learningPathRepository.findById(id).flatMap {
        case None => Future.successful(None)
        case Some(lp) =>
          learningPathRepository.findNodesByPathId(lp.id).map { nodes =>
            val nodeResps = nodes.map { n =>
              val parsedResources = Try {
                if (n.resourcesJson != null && n.resourcesJson.trim.nonEmpty && n.resourcesJson != "[]") {
                  n.resourcesJson.parseJson.convertTo[Seq[NodeResourceResponse]]
                } else Nil
              }.getOrElse(Nil)

              LearningPathNodeResponse(
                id = n.nodeId,
                title = n.title,
                description = n.description,
                skillIds = n.skillIds,
                prerequisiteIds = n.prerequisiteIds,
                estimatedHours = n.estimatedHours,
                sequence = n.sequence,
                resources = parsedResources
              )
            }
            Some(LearningPathResponse(lp.title, lp.description, lp.estimatedHours, Nil, nodeResps, Nil))
          }
      }
    }
  }
}
