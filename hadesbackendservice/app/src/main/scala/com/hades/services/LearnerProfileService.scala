package com.hades.services

import com.hades.models.LearnerProfile
import com.hades.repositories.LearnerProfileRepository
import com.hades.schemas.ProfileUpdateRequest

import scala.concurrent.{ExecutionContext, Future}

trait LearnerProfileService {
  def getProfile(userId: String): Future[LearnerProfile]
  def updateProfile(userId: String, req: ProfileUpdateRequest): Future[LearnerProfile]
}

class LearnerProfileServiceImpl(profileRepo: LearnerProfileRepository)(implicit ec: ExecutionContext) extends LearnerProfileService {

  override def getProfile(userId: String): Future[LearnerProfile] = {
    profileRepo.findByUserId(userId).map {
      case Some(p) => p
      case None => LearnerProfile(userId = userId)
    }
  }

  override def updateProfile(userId: String, req: ProfileUpdateRequest): Future[LearnerProfile] = {
    getProfile(userId).flatMap { existing =>
      val updated = existing.copy(
        experienceLevel = req.experienceLevel.getOrElse(existing.experienceLevel),
        minutesPerDay = req.minutesPerDay.getOrElse(existing.minutesPerDay),
        daysPerWeek = req.daysPerWeek.getOrElse(existing.daysPerWeek),
        targetRole = req.targetRole.getOrElse(existing.targetRole),
        learningPreferences = req.learningPreferences.getOrElse(existing.learningPreferences)
      )
      profileRepo.save(updated)
    }
  }
}
