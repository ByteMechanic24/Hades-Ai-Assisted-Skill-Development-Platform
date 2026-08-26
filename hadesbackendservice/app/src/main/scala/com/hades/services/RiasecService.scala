package com.hades.services

import com.hades.models.RiasecResult
import com.hades.repositories.RiasecRepository
import com.hades.schemas.RiasecRequest
import java.util.UUID
import scala.concurrent.{ExecutionContext, Future}

trait RiasecService {
  def getResult(userId: String): Future[Option[RiasecResult]]
  def saveResult(userId: String, req: RiasecRequest): Future[RiasecResult]
}

class RiasecServiceImpl(riasecRepo: RiasecRepository)(implicit ec: ExecutionContext) extends RiasecService {

  override def getResult(userId: String): Future[Option[RiasecResult]] = {
    riasecRepo.findByUserId(userId)
  }

  override def saveResult(userId: String, req: RiasecRequest): Future[RiasecResult] = {
    riasecRepo.findByUserId(userId).flatMap { existingOpt =>
      val entity = RiasecResult(
        id = existingOpt.map(_.id).getOrElse(UUID.randomUUID().toString),
        userId = userId,
        realistic = req.realistic,
        investigative = req.investigative,
        artistic = req.artistic,
        social = req.social,
        enterprising = req.enterprising,
        conventional = req.conventional
      )
      riasecRepo.save(entity)
    }
  }
}
