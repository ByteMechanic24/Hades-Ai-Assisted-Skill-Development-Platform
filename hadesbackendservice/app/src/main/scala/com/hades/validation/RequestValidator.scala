package com.hades.validation

import com.hades.errors.ValidationException
import com.hades.schemas.LearningPathRequest

object RequestValidator {

  def validate(request: LearningPathRequest): Either[ValidationException, LearningPathRequest] = {
    val errors = scala.collection.mutable.ListBuffer[String]()

    if (request.learner.experienceLevel.trim.isEmpty) {
      errors += "learner.experience_level must not be empty."
    }

    if (request.goal.title.trim.isEmpty) {
      errors += "goal.title must not be empty."
    }

    if (request.goal.description.trim.isEmpty) {
      errors += "goal.description must not be empty."
    }

    if (request.learner.availability.minutesPerDay <= 0) {
      errors += "availability.minutes_per_day must be greater than 0."
    }

    if (request.learner.availability.daysPerWeek <= 0) {
      errors += "availability.days_per_week must be greater than 0."
    }

    request.learner.existingSkills.zipWithIndex.foreach { case (skill, idx) =>
      if (skill.confidence < 0.0 || skill.confidence > 1.0) {
        errors += s"existing_skills[$idx].confidence must be between 0.0 and 1.0."
      }
    }

    request.learner.riasec.foreach { r =>
      val scores = Map(
        "realistic" -> r.realistic,
        "investigative" -> r.investigative,
        "artistic" -> r.artistic,
        "social" -> r.social,
        "enterprising" -> r.enterprising,
        "conventional" -> r.conventional
      )
      scores.foreach { case (name, valScore) =>
        if (valScore < 0.0 || valScore > 1.0) {
          errors += s"riasec.$name score must be between 0.0 and 1.0."
        }
      }
    }

    if (errors.nonEmpty) {
      Left(new ValidationException(errors.mkString(" ")))
    } else {
      Right(request)
    }
  }
}
