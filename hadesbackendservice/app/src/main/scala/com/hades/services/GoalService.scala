package com.hades.services

import com.hades.models.{CareerGoal, LearningGoal}
import com.hades.repositories.{CareerGoalRepository, LearningGoalRepository}
import com.hades.schemas.GoalCreateRequest
import java.util.UUID
import scala.concurrent.{ExecutionContext, Future}

trait GoalService {
  def createLearningGoal(userId: String, req: GoalCreateRequest): Future[LearningGoal]
  def getActiveLearningGoal(userId: String): Future[Option[LearningGoal]]
  def getActiveCareerGoal(userId: String): Future[Option[CareerGoal]]
}

class GoalServiceImpl(
  learningGoalRepo: LearningGoalRepository,
  careerGoalRepo: CareerGoalRepository
)(implicit ec: ExecutionContext) extends GoalService {

  override def createLearningGoal(userId: String, req: GoalCreateRequest): Future[LearningGoal] = {
    val lGoal = LearningGoal(
      id = UUID.randomUUID().toString,
      userId = userId,
      title = req.title,
      description = req.description,
      isActive = true
    )

    val cGoalFut = req.targetRole match {
      case Some(role) if role.trim.nonEmpty =>
        val cGoal = CareerGoal(
          id = UUID.randomUUID().toString,
          userId = userId,
          title = s"Target: $role",
          targetRole = role,
          isActive = true
        )
        careerGoalRepo.save(cGoal)
      case _ => Future.successful(())
    }

    cGoalFut.flatMap(_ => learningGoalRepo.save(lGoal))
  }

  override def getActiveLearningGoal(userId: String): Future[Option[LearningGoal]] = {
    learningGoalRepo.findActiveByUserId(userId)
  }

  override def getActiveCareerGoal(userId: String): Future[Option[CareerGoal]] = {
    careerGoalRepo.findActiveByUserId(userId)
  }
}
