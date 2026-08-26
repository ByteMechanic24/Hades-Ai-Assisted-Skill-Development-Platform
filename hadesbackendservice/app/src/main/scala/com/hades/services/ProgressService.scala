package com.hades.services

import com.hades.models.{ProgressEvent, ResourceProgress, SkillProgress}
import com.hades.repositories.{EventRepository, LearningPathRepository, ProgressRepository}
import com.hades.schemas.ProgressEventRequest
import java.time.Instant
import java.util.UUID
import scala.concurrent.{ExecutionContext, Future}

trait ProgressService {
  def recordEvent(userId: String, req: ProgressEventRequest): Future[ProgressEvent]
  def getEvents(userId: String): Future[Seq[ProgressEvent]]
}

class ProgressServiceImpl(
  eventRepo: EventRepository,
  progressRepo: ProgressRepository,
  learningPathRepo: LearningPathRepository,
  milestoneService: MilestoneService
)(implicit ec: ExecutionContext) extends ProgressService {

  override def recordEvent(userId: String, req: ProgressEventRequest): Future[ProgressEvent] = {
    val event = ProgressEvent(
      id = UUID.randomUUID().toString,
      userId = userId,
      eventType = req.eventType,
      entityId = req.entityId,
      payload = req.payload
    )

    for {
      savedEvent <- eventRepo.save(event)
      _ <- updateProgressState(userId, savedEvent)
      activePathOpt <- learningPathRepo.findActiveByUserId(userId)
      _ <- activePathOpt match {
        case Some(path) => milestoneService.evaluateUserMilestones(userId, path.id)
        case None => Future.successful(Nil)
      }
    } yield savedEvent
  }

  override def getEvents(userId: String): Future[Seq[ProgressEvent]] = {
    eventRepo.findByUserId(userId)
  }

  private def updateProgressState(userId: String, event: ProgressEvent): Future[Unit] = {
    event.eventType.toUpperCase match {
      case "RESOURCE_COMPLETED" =>
        if (event.entityId.nonEmpty) {
          val rp = ResourceProgress(
            id = UUID.randomUUID().toString,
            userId = userId,
            resourceId = event.entityId,
            status = "completed",
            progressPercent = 100.0,
            completedAt = Some(Instant.now())
          )
          progressRepo.saveResourceProgress(rp).map(_ => ())
        } else Future.successful(())

      case "RESOURCE_STARTED" =>
        if (event.entityId.nonEmpty) {
          val rp = ResourceProgress(
            id = UUID.randomUUID().toString,
            userId = userId,
            resourceId = event.entityId,
            status = "in_progress",
            progressPercent = 25.0
          )
          progressRepo.saveResourceProgress(rp).map(_ => ())
        } else Future.successful(())

      case _ =>
        Future.successful(())
    }
  }
}
