package com.hades.services

import com.hades.models.{Skill, SkillProgress}
import com.hades.repositories.{ProgressRepository, SkillRepository}

import scala.concurrent.{ExecutionContext, Future}

trait SkillService {
  def listSkills(): Future[Seq[Skill]]
  def getSkill(id: String): Future[Option[Skill]]
  def getSkillProgress(userId: String, skillId: String): Future[Option[SkillProgress]]
}

class SkillServiceImpl(
  skillRepo: SkillRepository,
  progressRepo: ProgressRepository
)(implicit ec: ExecutionContext) extends SkillService {

  override def listSkills(): Future[Seq[Skill]] = skillRepo.listAll()

  override def getSkill(id: String): Future[Option[Skill]] = skillRepo.findById(id)

  override def getSkillProgress(userId: String, skillId: String): Future[Option[SkillProgress]] = {
    progressRepo.findSkillProgress(userId, skillId)
  }
}
