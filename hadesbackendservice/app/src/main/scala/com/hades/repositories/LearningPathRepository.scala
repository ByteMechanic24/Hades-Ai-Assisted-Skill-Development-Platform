package com.hades.repositories

import com.hades.models.{LearningPath, LearningPathNode, Milestone}
import slick.jdbc.PostgresProfile.api._
import java.sql.Timestamp
import scala.concurrent.{ExecutionContext, Future}

trait LearningPathRepository {
  def saveTransactional(
    path: LearningPath,
    nodes: Seq[LearningPathNode],
    milestones: Seq[Milestone]
  ): Future[LearningPath]

  def findById(id: String): Future[Option[LearningPath]]
  def findActiveByUserId(userId: String): Future[Option[LearningPath]]
  def findNodesByPathId(pathId: String): Future[Seq[LearningPathNode]]
  def updateNodeStatus(pathId: String, nodeId: String, status: String): Future[Unit]
}

class PostgresLearningPathRepository(db: Database)(implicit ec: ExecutionContext) extends LearningPathRepository {
  private val fallback = new InMemoryLearningPathRepository()

  private class LearningPathTable(tag: Tag) extends Table[LearningPath](tag, "learning_paths") {
    def id = column[String]("id", O.PrimaryKey)
    def userId = column[String]("user_id")
    def goalId = column[String]("goal_id")
    def title = column[String]("title")
    def description = column[String]("description")
    def estimatedHours = column[Int]("estimated_hours")
    def status = column[String]("status")
    def createdAt = column[Timestamp]("created_at")
    def updatedAt = column[Timestamp]("updated_at")

    def * = (id, userId, goalId, title, description, estimatedHours, status, createdAt, updatedAt).shaped <> (
      { case (id, uId, gId, title, desc, hours, status, createdAt, updatedAt) =>
        LearningPath(id, uId, gId, title, desc, hours, status, createdAt.toInstant, updatedAt.toInstant)
      },
      { lp: LearningPath =>
        Some((lp.id, lp.userId, lp.goalId, lp.title, lp.description, lp.estimatedHours, lp.status, Timestamp.from(lp.createdAt), Timestamp.from(lp.updatedAt)))
      }
    )
  }

  private class NodeTable(tag: Tag) extends Table[LearningPathNode](tag, "learning_path_nodes") {
    def id = column[String]("id", O.PrimaryKey)
    def learningPathId = column[String]("learning_path_id")
    def nodeId = column[String]("node_id")
    def title = column[String]("title")
    def description = column[String]("description")
    def estimatedHours = column[Int]("estimated_hours")
    def sequence = column[Int]("sequence")
    def status = column[String]("status")
    def skillIds = column[String]("skill_ids")
    def prerequisiteIds = column[String]("prerequisite_ids")
    def createdAt = column[Timestamp]("created_at")
    def updatedAt = column[Timestamp]("updated_at")

    def * = (id, learningPathId, nodeId, title, description, estimatedHours, sequence, status, skillIds, prerequisiteIds, createdAt, updatedAt).shaped <> (
      { case (id, pathId, nId, title, desc, hours, seq, status, sIds, pIds, createdAt, updatedAt) =>
        LearningPathNode(
          id = id,
          learningPathId = pathId,
          nodeId = nId,
          title = title,
          description = desc,
          estimatedHours = hours,
          sequence = seq,
          status = status,
          skillIds = if (sIds.trim.isEmpty) Nil else sIds.split(",").toSeq,
          prerequisiteIds = if (pIds.trim.isEmpty) Nil else pIds.split(",").toSeq,
          createdAt = createdAt.toInstant,
          updatedAt = updatedAt.toInstant
        )
      },
      { n: LearningPathNode =>
        Some((
          n.id,
          n.learningPathId,
          n.nodeId,
          n.title,
          n.description,
          n.estimatedHours,
          n.sequence,
          n.status,
          n.skillIds.mkString(","),
          n.prerequisiteIds.mkString(","),
          Timestamp.from(n.createdAt),
          Timestamp.from(n.updatedAt)
        ))
      }
    )
  }

  private class MilestoneTable(tag: Tag) extends Table[Milestone](tag, "milestones") {
    def id = column[String]("id", O.PrimaryKey)
    def learningPathId = column[String]("learning_path_id")
    def title = column[String]("title")
    def requiredNodeIds = column[String]("required_node_ids")
    def requiredScore = column[Double]("required_score")

    def * = (id, learningPathId, title, requiredNodeIds, requiredScore).shaped <> (
      { case (id, pathId, title, rNodeIds, rScore) =>
        Milestone(id, pathId, title, if (rNodeIds.trim.isEmpty) Nil else rNodeIds.split(",").toSeq, rScore)
      },
      { m: Milestone =>
        Some((m.id, m.learningPathId, m.title, m.requiredNodeIds.mkString(","), m.requiredScore))
      }
    )
  }

  private val paths = TableQuery[LearningPathTable]
  private val nodesTable = TableQuery[NodeTable]
  private val milestonesTable = TableQuery[MilestoneTable]

  override def saveTransactional(
    path: LearningPath,
    nodes: Seq[LearningPathNode],
    milestones: Seq[Milestone]
  ): Future[LearningPath] = {
    val action = (for {
      _ <- paths.filter(_.userId === path.userId).map(_.status).update("archived")
      _ <- paths.insertOrUpdate(path)
      _ <- nodesTable.filter(_.learningPathId === path.id).delete
      _ <- nodesTable ++= nodes
      _ <- milestonesTable.filter(_.learningPathId === path.id).delete
      _ <- milestonesTable ++= milestones
    } yield path).transactionally

    db.run(action).recoverWith { case _ =>
      fallback.saveTransactional(path, nodes, milestones)
    }
  }

  override def findById(id: String): Future[Option[LearningPath]] = {
    db.run(paths.filter(_.id === id).result.headOption).recoverWith { case _ =>
      fallback.findById(id)
    }
  }

  override def findActiveByUserId(userId: String): Future[Option[LearningPath]] = {
    db.run(paths.filter(p => p.userId === userId && p.status === "active").result.headOption).recoverWith { case _ =>
      fallback.findActiveByUserId(userId)
    }
  }

  override def findNodesByPathId(pathId: String): Future[Seq[LearningPathNode]] = {
    db.run(nodesTable.filter(_.learningPathId === pathId).sortBy(_.sequence.asc).result).recoverWith { case _ =>
      fallback.findNodesByPathId(pathId)
    }
  }

  override def updateNodeStatus(pathId: String, nodeId: String, status: String): Future[Unit] = {
    val q = nodesTable.filter(n => n.learningPathId === pathId && n.nodeId === nodeId).map(_.status)
    db.run(q.update(status)).map(_ => ()).recoverWith { case _ =>
      fallback.updateNodeStatus(pathId, nodeId, status)
    }
  }
}

class InMemoryLearningPathRepository extends LearningPathRepository {
  private val pathStore = java.util.concurrent.ConcurrentHashMap.newKeySet[LearningPath]()
  private val nodeStore = java.util.concurrent.ConcurrentHashMap.newKeySet[LearningPathNode]()
  private val milestoneStore = java.util.concurrent.ConcurrentHashMap.newKeySet[Milestone]()

  override def saveTransactional(
    path: LearningPath,
    nodes: Seq[LearningPathNode],
    milestones: Seq[Milestone]
  ): Future[LearningPath] = {
    import scala.jdk.CollectionConverters._
    // Archive existing active paths
    pathStore.asScala.filter(_.userId == path.userId).foreach { existing =>
      pathStore.remove(existing)
      pathStore.add(existing.copy(status = "archived"))
    }
    pathStore.add(path)

    nodeStore.removeIf(_.learningPathId == path.id)
    nodes.foreach(nodeStore.add)

    milestoneStore.removeIf(_.learningPathId == path.id)
    milestones.foreach(milestoneStore.add)

    Future.successful(path)
  }

  override def findById(id: String): Future[Option[LearningPath]] = {
    import scala.jdk.CollectionConverters._
    Future.successful(pathStore.asScala.find(_.id == id))
  }

  override def findActiveByUserId(userId: String): Future[Option[LearningPath]] = {
    import scala.jdk.CollectionConverters._
    Future.successful(pathStore.asScala.find(p => p.userId == userId && p.status == "active"))
  }

  override def findNodesByPathId(pathId: String): Future[Seq[LearningPathNode]] = {
    import scala.jdk.CollectionConverters._
    Future.successful(nodeStore.asScala.filter(_.learningPathId == pathId).toSeq.sortBy(_.sequence))
  }

  override def updateNodeStatus(pathId: String, nodeId: String, status: String): Future[Unit] = {
    import scala.jdk.CollectionConverters._
    nodeStore.asScala.find(n => n.learningPathId == pathId && n.nodeId == nodeId).foreach { existing =>
      nodeStore.remove(existing)
      nodeStore.add(existing.copy(status = status))
    }
    Future.successful(())
  }
}
