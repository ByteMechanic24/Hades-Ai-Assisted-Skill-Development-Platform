package com.hades.hadesapi

import org.apache.pekko.http.scaladsl.model.{ContentTypes, HttpEntity, StatusCodes}
import org.apache.pekko.http.scaladsl.server.Directives._
import org.apache.pekko.http.scaladsl.server.Route
import com.hades.controllers._

class Routes(
  learningPathController: LearningPathController,
  learnerProfileController: LearnerProfileController = null,
  onboardingController: OnboardingController = null,
  riasecController: RiasecController = null,
  goalController: GoalController = null,
  skillController: SkillController = null,
  resourceController: ResourceController = null,
  progressController: ProgressController = null,
  assessmentController: AssessmentController = null,
  milestoneController: MilestoneController = null,
  recommendationController: RecommendationController = null,
  dashboardController: DashboardController = null,
  assistantController: AssistantController = null,
  authController: AuthController = null
) {

  val healthRoute: Route = path("health") {
    get {
      complete(
        StatusCodes.OK,
        HttpEntity(ContentTypes.`application/json`, """{"status":"ok"}""")
      )
    }
  }

  val routes: Route = {
    val routeList = scala.collection.mutable.ListBuffer[Route](
      healthRoute,
      learningPathController.route
    )

    if (authController != null) routeList += authController.route
    if (learnerProfileController != null) routeList += learnerProfileController.route
    if (onboardingController != null) routeList += onboardingController.route
    if (riasecController != null) routeList += riasecController.route
    if (goalController != null) routeList += goalController.route
    if (skillController != null) routeList += skillController.route
    if (resourceController != null) routeList += resourceController.route
    if (progressController != null) routeList += progressController.route
    if (assessmentController != null) routeList += assessmentController.route
    if (milestoneController != null) routeList += milestoneController.route
    if (recommendationController != null) routeList += recommendationController.route
    if (dashboardController != null) routeList += dashboardController.route
    if (assistantController != null) routeList += assistantController.route

    concat(routeList.toSeq: _*)
  }
}
