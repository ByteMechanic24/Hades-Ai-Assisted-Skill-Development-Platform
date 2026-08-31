package com.hades.models

import java.time.Instant

case class User(
  id: String,
  email: String,
  name: String,
  authProvider: String = "dev",
  createdAt: Instant = Instant.now(),
  updatedAt: Instant = Instant.now()
)

case class LearnerProfile(
  userId: String,
  experienceLevel: String = "beginner",
  minutesPerDay: Int = 60,
  daysPerWeek: Int = 5,
  targetRole: String = "",
  learningPreferences: Seq[String] = Seq("hands_on", "video"),
  createdAt: Instant = Instant.now(),
  updatedAt: Instant = Instant.now()
)

case class Interest(
  id: String,
  userId: String,
  name: String,
  createdAt: Instant = Instant.now()
)

case class CareerGoal(
  id: String,
  userId: String,
  title: String,
  targetRole: String,
  isActive: Boolean = true,
  createdAt: Instant = Instant.now(),
  updatedAt: Instant = Instant.now()
)

case class LearningGoal(
  id: String,
  userId: String,
  title: String,
  description: String,
  isActive: Boolean = true,
  createdAt: Instant = Instant.now(),
  updatedAt: Instant = Instant.now()
)

case class RiasecResult(
  id: String,
  userId: String,
  realistic: Double,
  investigative: Double,
  artistic: Double,
  social: Double,
  enterprising: Double,
  conventional: Double,
  createdAt: Instant = Instant.now(),
  updatedAt: Instant = Instant.now()
)

case class Skill(
  id: String,
  name: String,
  difficulty: String = "beginner",
  category: String = "",
  createdAt: Instant = Instant.now(),
  updatedAt: Instant = Instant.now()
)

case class SkillPrerequisite(
  id: String,
  skillId: String,
  prerequisiteSkillId: String,
  createdAt: Instant = Instant.now()
)

case class LearningPath(
  id: String,
  userId: String,
  goalId: String = "",
  title: String,
  description: String,
  estimatedHours: Int,
  status: String = "active",
  createdAt: Instant = Instant.now(),
  updatedAt: Instant = Instant.now()
)

case class LearningPathNode(
  id: String,
  learningPathId: String,
  nodeId: String,
  title: String,
  description: String,
  estimatedHours: Int,
  sequence: Int,
  status: String = "locked",
  skillIds: Seq[String] = Nil,
  prerequisiteIds: Seq[String] = Nil,
  resourcesJson: String = "[]",
  createdAt: Instant = Instant.now(),
  updatedAt: Instant = Instant.now()
)

case class Resource(
  id: String,
  title: String,
  url: String,
  provider: String = "",
  description: String = "",
  contentType: String = "article",
  difficulty: String = "beginner",
  durationMinutes: Int = 30,
  qualityScore: Double = 0.8,
  createdAt: Instant = Instant.now(),
  updatedAt: Instant = Instant.now()
)

case class ResourceSkill(
  id: String,
  resourceId: String,
  skillId: String
)

case class SkillProgress(
  id: String,
  userId: String,
  skillId: String,
  progress: Double = 0.0,
  confidence: Double = 0.0,
  lastActivityAt: Instant = Instant.now()
)

case class ResourceProgress(
  id: String,
  userId: String,
  resourceId: String,
  status: String = "not_started",
  progressPercent: Double = 0.0,
  completedAt: Option[Instant] = None
)

case class Assessment(
  id: String,
  title: String,
  skillId: String,
  passingScore: Int = 70,
  createdAt: Instant = Instant.now(),
  updatedAt: Instant = Instant.now()
)

case class AssessmentQuestion(
  id: String,
  assessmentId: String,
  questionText: String,
  options: Seq[String],
  correctOptionIndex: Int,
  explanation: String = ""
)

case class AssessmentResult(
  id: String,
  userId: String,
  assessmentId: String,
  score: Double,
  passed: Boolean,
  completedAt: Instant = Instant.now()
)

case class Milestone(
  id: String,
  learningPathId: String,
  title: String,
  requiredNodeIds: Seq[String] = Nil,
  requiredScore: Double = 70.0
)

case class UserMilestone(
  id: String,
  userId: String,
  milestoneId: String,
  status: String = "locked",
  completedAt: Option[Instant] = None
)

case class ProgressEvent(
  id: String,
  userId: String,
  eventType: String,
  entityId: String = "",
  payload: String = "{}",
  createdAt: Instant = Instant.now()
)

case class Recommendation(
  id: String,
  userId: String,
  resourceId: String,
  score: Double,
  explanation: String,
  createdAt: Instant = Instant.now()
)

case class LearnerState(
  user: User,
  profile: Option[LearnerProfile],
  interests: Seq[Interest],
  careerGoal: Option[CareerGoal],
  activeGoal: Option[LearningGoal],
  riasec: Option[RiasecResult],
  currentLearningPath: Option[LearningPath],
  learningNodes: Seq[LearningPathNode],
  skillProgresses: Seq[SkillProgress],
  resourceProgresses: Seq[ResourceProgress],
  userMilestones: Seq[UserMilestone],
  recentEvents: Seq[ProgressEvent]
)
