package com.hades.schemas

import spray.json._

case class ProfileUpdateRequest(
  experienceLevel: Option[String] = None,
  minutesPerDay: Option[Int] = None,
  daysPerWeek: Option[Int] = None,
  targetRole: Option[String] = None,
  learningPreferences: Option[Seq[String]] = None
)

case class ProfileResponse(
  userId: String,
  experienceLevel: String,
  minutesPerDay: Int,
  daysPerWeek: Int,
  targetRole: String,
  learningPreferences: Seq[String]
)

case class OnboardingRequest(
  experienceLevel: String,
  minutesPerDay: Int,
  daysPerWeek: Int,
  targetRole: String,
  interests: Seq[String],
  learningPreferences: Seq[String],
  goalTitle: String,
  goalDescription: String
)

case class RiasecRequest(
  realistic: Double,
  investigative: Double,
  artistic: Double,
  social: Double,
  enterprising: Double,
  conventional: Double
)

case class GoalCreateRequest(
  title: String,
  description: String,
  targetRole: Option[String] = None
)

case class GoalResponse(
  id: String,
  title: String,
  description: String,
  isActive: Boolean
)

case class ProgressEventRequest(
  eventType: String,
  entityId: String,
  payload: String = "{}"
)

case class AssessmentSubmitRequest(
  answers: Map[String, Int] // questionId -> selectedOptionIndex
)

case class AssessmentSubmitResponse(
  score: Double,
  passed: Boolean,
  passingScore: Int
)

case class AssistantChatRequest(
  message: String
)

case class AssistantChatResponse(
  reply: String
)

case class DashboardResponse(
  user: ProfileResponse,
  activeGoal: Option[GoalResponse],
  currentPath: Option[LearningPathResponse],
  currentNodeId: Option[String],
  overallProgressPercent: Double,
  recentActivity: Seq[String],
  nextRecommendedAction: String
)

object ApiJsonProtocol extends DefaultJsonProtocol {
  import LearningPathJsonProtocol._

  implicit val profileUpdateRequestFormat: RootJsonFormat[ProfileUpdateRequest] = jsonFormat5(ProfileUpdateRequest)
  implicit val profileResponseFormat: RootJsonFormat[ProfileResponse] = jsonFormat6(ProfileResponse)
  implicit val onboardingRequestFormat: RootJsonFormat[OnboardingRequest] = jsonFormat8(OnboardingRequest)
  implicit val riasecRequestFormat: RootJsonFormat[RiasecRequest] = jsonFormat6(RiasecRequest)
  implicit val goalCreateRequestFormat: RootJsonFormat[GoalCreateRequest] = jsonFormat3(GoalCreateRequest)
  implicit val goalResponseFormat: RootJsonFormat[GoalResponse] = jsonFormat4(GoalResponse)
  implicit val progressEventRequestFormat: RootJsonFormat[ProgressEventRequest] = jsonFormat3(ProgressEventRequest)
  implicit val assessmentSubmitRequestFormat: RootJsonFormat[AssessmentSubmitRequest] = jsonFormat1(AssessmentSubmitRequest)
  implicit val assessmentSubmitResponseFormat: RootJsonFormat[AssessmentSubmitResponse] = jsonFormat3(AssessmentSubmitResponse)
  implicit val assistantChatRequestFormat: RootJsonFormat[AssistantChatRequest] = jsonFormat1(AssistantChatRequest)
  implicit val assistantChatResponseFormat: RootJsonFormat[AssistantChatResponse] = jsonFormat1(AssistantChatResponse)
  implicit val dashboardResponseFormat: RootJsonFormat[DashboardResponse] = jsonFormat7(DashboardResponse)
}
