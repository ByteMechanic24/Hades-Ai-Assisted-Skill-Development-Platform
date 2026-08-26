package com.hades.services

import com.hades.models.LearnerState
import com.hades.repositories._
import com.hades.schemas._

import scala.concurrent.{ExecutionContext, Future}

trait DashboardService {
  def getDashboard(userId: String): Future[DashboardResponse]
  def getLearnerState(userId: String): Future[LearnerState]
}

class DashboardServiceImpl(
  userRepo: UserRepository,
  profileRepo: LearnerProfileRepository,
  interestRepo: InterestRepository,
  careerGoalRepo: CareerGoalRepository,
  learningGoalRepo: LearningGoalRepository,
  riasecRepo: RiasecRepository,
  learningPathRepo: LearningPathRepository,
  progressRepo: ProgressRepository,
  milestoneRepo: MilestoneRepository,
  eventRepo: EventRepository,
  recommendationService: RecommendationService
)(implicit ec: ExecutionContext) extends DashboardService {

  override def getLearnerState(userId: String): Future[LearnerState] = {
    for {
      userOpt <- userRepo.findById(userId)
      user = userOpt.getOrElse(com.hades.models.User(userId, s"$userId@hades.ai", "Learner"))
      profileOpt <- profileRepo.findByUserId(userId)
      interests <- interestRepo.findByUserId(userId)
      careerOpt <- careerGoalRepo.findActiveByUserId(userId)
      lGoalOpt <- learningGoalRepo.findActiveByUserId(userId)
      riasecOpt <- riasecRepo.findByUserId(userId)
      pathOpt <- learningPathRepo.findActiveByUserId(userId)
      nodes <- pathOpt.map(p => learningPathRepo.findNodesByPathId(p.id)).getOrElse(Future.successful(Nil))
      sProgress <- progressRepo.findSkillProgressByUser(userId)
      rProgress <- progressRepo.findResourceProgressByUser(userId)
      uMilestones <- milestoneRepo.findUserMilestones(userId)
      events <- eventRepo.findByUserId(userId, limit = 10)
    } yield {
      LearnerState(
        user = user,
        profile = profileOpt,
        interests = interests,
        careerGoal = careerOpt,
        activeGoal = lGoalOpt,
        riasec = riasecOpt,
        currentLearningPath = pathOpt,
        learningNodes = nodes,
        skillProgresses = sProgress,
        resourceProgresses = rProgress,
        userMilestones = uMilestones,
        recentEvents = events
      )
    }
  }

  override def getDashboard(userId: String): Future[DashboardResponse] = {
    getLearnerState(userId).map { state =>
      val p = state.profile.getOrElse(com.hades.models.LearnerProfile(userId = userId))
      val profileResp = ProfileResponse(
        userId = userId,
        experienceLevel = p.experienceLevel,
        minutesPerDay = p.minutesPerDay,
        daysPerWeek = p.daysPerWeek,
        targetRole = p.targetRole,
        learningPreferences = p.learningPreferences
      )

      val goalResp = state.activeGoal.map { g =>
        GoalResponse(g.id, g.title, g.description, g.isActive)
      }

      val pathResp = state.currentLearningPath.map { lp =>
        val nodeResponses = state.learningNodes.map { n =>
          LearningPathNodeResponse(n.nodeId, n.title, n.description, n.skillIds, n.prerequisiteIds, n.estimatedHours, n.sequence)
        }
        LearningPathResponse(lp.title, lp.description, lp.estimatedHours, Nil, nodeResponses, Nil)
      }

      val currentNodeId = state.learningNodes.find(_.status != "completed").map(_.nodeId)
      val totalNodes = state.learningNodes.size
      val completedNodes = state.learningNodes.count(_.status == "completed")
      val progressPct = if (totalNodes > 0) (completedNodes.toDouble / totalNodes) * 100.0 else 0.0

      val activities = state.recentEvents.map(e => s"${e.eventType} (${e.createdAt})")
      val nextAction = currentNodeId.map(id => s"Continue with node '$id'").getOrElse("Generate a personalized learning path to start learning!")

      DashboardResponse(
        user = profileResp,
        activeGoal = goalResp,
        currentPath = pathResp,
        currentNodeId = currentNodeId,
        overallProgressPercent = progressPct,
        recentActivity = activities,
        nextRecommendedAction = nextAction
      )
    }
  }
}
