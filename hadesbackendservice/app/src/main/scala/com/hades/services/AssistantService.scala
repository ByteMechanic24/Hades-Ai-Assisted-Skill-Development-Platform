package com.hades.services

import com.hades.clients.AiServiceClient

import scala.concurrent.{ExecutionContext, Future}

trait AssistantService {
  def chat(userId: String, message: String): Future[String]
}

class AssistantServiceImpl(
  dashboardService: DashboardService,
  aiServiceClient: AiServiceClient
)(implicit ec: ExecutionContext) extends AssistantService {

  override def chat(userId: String, message: String): Future[String] = {
    dashboardService.getLearnerState(userId).flatMap { state =>
      val p = state.profile.getOrElse(com.hades.models.LearnerProfile(userId = userId))
      val targetRole = if (p.targetRole.nonEmpty) p.targetRole else "Tech Learner"
      val goalStr = state.activeGoal.map(_.title).getOrElse("No active goal set")
      val pathStr = state.currentLearningPath.map(_.title).getOrElse("No learning path generated yet")
      val currNodeStr = state.learningNodes.find(_.status != "completed").map(_.title).getOrElse("All nodes complete")
      val interestsStr = state.interests.map(_.name).mkString(", ")

      val enrichedContext =
        s"Learner Target Role: $targetRole. Experience Level: ${p.experienceLevel}. Daily Availability: ${p.minutesPerDay} mins/day. " +
        s"Active Goal: $goalStr. Current Learning Path: $pathStr. Current Active Node: $currNodeStr. Interests: $interestsStr."

      aiServiceClient.chat(message, enrichedContext)
    }
  }
}
