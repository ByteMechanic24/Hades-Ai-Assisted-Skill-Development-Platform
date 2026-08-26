package com.hades.validation

import com.hades.errors.ValidationException
import com.hades.schemas.LearningPathResponse

object AiResponseValidator {

  def validate(response: LearningPathResponse): Either[ValidationException, LearningPathResponse] = {
    val errors = scala.collection.mutable.ListBuffer[String]()

    if (response.title.trim.isEmpty) {
      errors += "Learning path title must not be empty."
    }

    if (response.description.trim.isEmpty) {
      errors += "Learning path description must not be empty."
    }

    if (response.estimatedHours <= 0) {
      errors += s"Learning path estimated_hours must be positive, got ${response.estimatedHours}."
    }

    // Validate skills
    val skillIds = response.skills.map(_.id)
    if (skillIds.distinct.size != skillIds.size) {
      errors += "Duplicate skill IDs found in AI response."
    }

    val validDifficulties = Set("beginner", "intermediate", "advanced")
    response.skills.foreach { skill =>
      if (skill.name.trim.isEmpty) {
        errors += s"Skill '${skill.id}' name must not be empty."
      }
      if (!validDifficulties.contains(skill.difficulty.toLowerCase)) {
        errors += s"Skill '${skill.id}' has invalid difficulty '${skill.difficulty}'."
      }
    }

    val skillIdSet = skillIds.toSet

    // Validate nodes
    val nodeIds = response.nodes.map(_.id)
    if (nodeIds.distinct.size != nodeIds.size) {
      errors += "Duplicate node IDs found in AI response."
    }

    val nodeIdSet = nodeIds.toSet

    response.nodes.foreach { node =>
      if (node.title.trim.isEmpty) {
        errors += s"Node '${node.id}' title must not be empty."
      }
      if (node.estimatedHours <= 0) {
        errors += s"Node '${node.id}' estimated_hours must be positive."
      }

      // Check skill references
      node.skillIds.foreach { sId =>
        if (!skillIdSet.contains(sId)) {
          errors += s"Node '${node.id}' references missing skill '$sId'."
        }
      }

      // Check prerequisite references
      node.prerequisiteIds.foreach { pId =>
        if (!nodeIdSet.contains(pId)) {
          errors += s"Node '${node.id}' references missing prerequisite node '$pId'."
        }
        if (pId == node.id) {
          errors += s"Node '${node.id}' cannot depend on itself as a prerequisite."
        }
      }
    }

    // Cycle detection for node prerequisites (Kahn's algorithm)
    if (nodeIds.nonEmpty && errors.isEmpty) {
      val inDegree = scala.collection.mutable.Map[String, Int]()
      val graph = scala.collection.mutable.Map[String, List[String]]()

      nodeIds.foreach { nId =>
        inDegree(nId) = 0
        graph(nId) = Nil
      }

      response.nodes.foreach { node =>
        node.prerequisiteIds.foreach { pId =>
          graph(pId) = node.id :: graph.getOrElse(pId, Nil)
          inDegree(node.id) = inDegree.getOrElse(node.id, 0) + 1
        }
      }

      val queue = scala.collection.mutable.Queue[String]()
      inDegree.foreach { case (nId, deg) =>
        if (deg == 0) queue.enqueue(nId)
      }

      var visitedCount = 0
      while (queue.nonEmpty) {
        val curr = queue.dequeue()
        visitedCount += 1
        graph.getOrElse(curr, Nil).foreach { neighbor =>
          inDegree(neighbor) = inDegree(neighbor) - 1
          if (inDegree(neighbor) == 0) {
            queue.enqueue(neighbor)
          }
        }
      }

      if (visitedCount != nodeIds.size) {
        errors += "Circular prerequisite dependency detected among learning path nodes."
      }
    }

    // Validate milestones
    val milestoneIds = response.milestones.map(_.id)
    if (milestoneIds.distinct.size != milestoneIds.size) {
      errors += "Duplicate milestone IDs found in AI response."
    }

    response.milestones.foreach { milestone =>
      if (milestone.title.trim.isEmpty) {
        errors += s"Milestone '${milestone.id}' title must not be empty."
      }
      milestone.nodeIds.foreach { nId =>
        if (!nodeIdSet.contains(nId)) {
          errors += s"Milestone '${milestone.id}' references missing node '$nId'."
        }
      }
    }

    if (errors.nonEmpty) {
      Left(new ValidationException(errors.mkString(" ")))
    } else {
      Right(response)
    }
  }
}
