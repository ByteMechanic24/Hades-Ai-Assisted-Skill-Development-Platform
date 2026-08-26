package com.hades.services

import com.hades.models.{Interest, LearnerProfile, LearningGoal}
import com.hades.repositories.InterestRepository
import com.hades.schemas.{GoalCreateRequest, OnboardingRequest, ProfileUpdateRequest}
import java.util.UUID
import scala.concurrent.{ExecutionContext, Future}

trait OnboardingService {
  def processOnboarding(userId: String, req: OnboardingRequest): Future[(LearnerProfile, LearningGoal)]
}

class OnboardingServiceImpl(
  profileService: LearnerProfileService,
  goalService: GoalService,
  interestRepo: InterestRepository
)(implicit ec: ExecutionContext) extends OnboardingService {

  override def processOnboarding(userId: String, req: OnboardingRequest): Future[(LearnerProfile, LearningGoal)] = {
    for {
      profile <- profileService.updateProfile(userId, ProfileUpdateRequest(
        experienceLevel = Some(req.experienceLevel),
        minutesPerDay = Some(req.minutesPerDay),
        daysPerWeek = Some(req.daysPerWeek),
        targetRole = Some(req.targetRole),
        learningPreferences = Some(req.learningPreferences)
      ))
      _ <- interestRepo.saveAll(userId, req.interests.map(name => Interest(UUID.randomUUID().toString, userId, name)))
      goal <- goalService.createLearningGoal(userId, GoalCreateRequest(req.goalTitle, req.goalDescription, Some(req.targetRole)))
    } yield (profile, goal)
  }
}
