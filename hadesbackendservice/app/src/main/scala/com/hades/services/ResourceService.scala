package com.hades.services

import com.hades.models.Resource
import com.hades.repositories.ResourceRepository

import scala.concurrent.{ExecutionContext, Future}

trait ResourceService {
  def listResources(): Future[Seq[Resource]]
  def getResource(id: String): Future[Option[Resource]]
}

class ResourceServiceImpl(resourceRepo: ResourceRepository)(implicit ec: ExecutionContext) extends ResourceService {
  override def listResources(): Future[Seq[Resource]] = resourceRepo.listAll()
  override def getResource(id: String): Future[Option[Resource]] = resourceRepo.findById(id)
}
