package com.hades.schemas

import spray.json._

case class LearningPathRequest(
  learner: LearnerContext,
  goal: LearningGoalRequest
)

case class LearnerContext(
  experienceLevel: String,
  interests: Seq[String],
  career: CareerContext,
  learningPreferences: Seq[String],
  availability: LearningAvailability,
  existingSkills: Seq[SkillConfidence],
  completedLearning: Seq[CompletedLearning],
  riasec: Option[RiasecProfile] = None
)

case class CareerContext(
  targetRole: String
)

case class LearningAvailability(
  minutesPerDay: Int,
  daysPerWeek: Int
)

case class SkillConfidence(
  name: String,
  confidence: Double
)

case class CompletedLearning(
  title: String,
  learningType: String
)

case class RiasecProfile(
  realistic: Double,
  investigative: Double,
  artistic: Double,
  social: Double,
  enterprising: Double,
  conventional: Double
)

case class LearningGoalRequest(
  title: String,
  description: String
)

case class NodeResourceResponse(
  id: String,
  title: String,
  url: String,
  resourceType: String,
  source: String,
  description: Option[String] = None,
  estimatedTime: Option[String] = None
)

case class LearningPathNodeResponse(
  id: String,
  title: String,
  description: String,
  skillIds: Seq[String] = Nil,
  prerequisiteIds: Seq[String] = Nil,
  estimatedHours: Int,
  sequence: Int,
  resources: Seq[NodeResourceResponse] = Nil
)

case class SkillResponse(
  id: String,
  name: String,
  difficulty: String
)

case class MilestoneResponse(
  id: String,
  title: String,
  nodeIds: Seq[String] = Nil
)

case class LearningPathResponse(
  title: String,
  description: String,
  estimatedHours: Int,
  skills: Seq[SkillResponse] = Nil,
  nodes: Seq[LearningPathNodeResponse] = Nil,
  milestones: Seq[MilestoneResponse] = Nil
)

object LearningPathJsonProtocol extends DefaultJsonProtocol {

  implicit val careerContextFormat: RootJsonFormat[CareerContext] = new RootJsonFormat[CareerContext] {
    def write(obj: CareerContext): JsValue = JsObject(
      "target_role" -> JsString(obj.targetRole)
    )
    def read(json: JsValue): CareerContext = {
      val fields = json.asJsObject.fields
      val targetRole = fields.get("target_role").collect { case JsString(s) => s }
        .getOrElse(deserializationError("Missing target_role in career"))
      CareerContext(targetRole)
    }
  }

  implicit val learningAvailabilityFormat: RootJsonFormat[LearningAvailability] = new RootJsonFormat[LearningAvailability] {
    def write(obj: LearningAvailability): JsValue = JsObject(
      "minutes_per_day" -> JsNumber(obj.minutesPerDay),
      "days_per_week" -> JsNumber(obj.daysPerWeek)
    )
    def read(json: JsValue): LearningAvailability = {
      val fields = json.asJsObject.fields
      val minutes = fields.get("minutes_per_day").collect { case JsNumber(n) => n.toInt }
        .getOrElse(deserializationError("Missing or invalid minutes_per_day in availability"))
      val days = fields.get("days_per_week").collect { case JsNumber(n) => n.toInt }
        .getOrElse(deserializationError("Missing or invalid days_per_week in availability"))
      LearningAvailability(minutes, days)
    }
  }

  implicit val skillConfidenceFormat: RootJsonFormat[SkillConfidence] = new RootJsonFormat[SkillConfidence] {
    def write(obj: SkillConfidence): JsValue = JsObject(
      "name" -> JsString(obj.name),
      "confidence" -> JsNumber(obj.confidence)
    )
    def read(json: JsValue): SkillConfidence = {
      val fields = json.asJsObject.fields
      val name = fields.get("name").collect { case JsString(s) => s }
        .getOrElse(deserializationError("Missing name in skill confidence"))
      val conf = fields.get("confidence").collect { case JsNumber(n) => n.toDouble }
        .getOrElse(deserializationError("Missing or invalid confidence in skill confidence"))
      SkillConfidence(name, conf)
    }
  }

  implicit val completedLearningFormat: RootJsonFormat[CompletedLearning] = new RootJsonFormat[CompletedLearning] {
    def write(obj: CompletedLearning): JsValue = JsObject(
      "title" -> JsString(obj.title),
      "type" -> JsString(obj.learningType)
    )
    def read(json: JsValue): CompletedLearning = {
      val fields = json.asJsObject.fields
      val title = fields.get("title").collect { case JsString(s) => s }
        .getOrElse(deserializationError("Missing title in completed learning"))
      val lType = fields.get("type").collect { case JsString(s) => s }
        .getOrElse(deserializationError("Missing type in completed learning"))
      CompletedLearning(title, lType)
    }
  }

  implicit val riasecProfileFormat: RootJsonFormat[RiasecProfile] = jsonFormat6(RiasecProfile)

  implicit val learnerContextFormat: RootJsonFormat[LearnerContext] = new RootJsonFormat[LearnerContext] {
    def write(obj: LearnerContext): JsValue = {
      val baseFields = Map[String, JsValue](
        "experience_level" -> JsString(obj.experienceLevel),
        "interests" -> JsArray(obj.interests.map(JsString(_)).toVector),
        "career" -> obj.career.toJson,
        "learning_preferences" -> JsArray(obj.learningPreferences.map(JsString(_)).toVector),
        "availability" -> obj.availability.toJson,
        "existing_skills" -> JsArray(obj.existingSkills.map(_.toJson).toVector),
        "completed_learning" -> JsArray(obj.completedLearning.map(_.toJson).toVector)
      )
      val fields = obj.riasec match {
        case Some(r) => baseFields + ("riasec" -> r.toJson)
        case None => baseFields
      }
      JsObject(fields)
    }

    def read(json: JsValue): LearnerContext = {
      val fields = json.asJsObject.fields
      val experienceLevel = fields.get("experience_level").collect { case JsString(s) => s }
        .getOrElse(deserializationError("Missing experience_level in learner"))
      val interests = fields.get("interests").collect {
        case JsArray(elements) => elements.collect { case JsString(s) => s }
      }.getOrElse(Nil)
      val career = fields.get("career").map(_.convertTo[CareerContext])
        .getOrElse(deserializationError("Missing career in learner"))
      val learningPreferences = fields.get("learning_preferences").collect {
        case JsArray(elements) => elements.collect { case JsString(s) => s }
      }.getOrElse(Nil)
      val availability = fields.get("availability").map(_.convertTo[LearningAvailability])
        .getOrElse(deserializationError("Missing availability in learner"))
      val existingSkills = fields.get("existing_skills").collect {
        case JsArray(elements) => elements.map(_.convertTo[SkillConfidence])
      }.getOrElse(Nil)
      val completedLearning = fields.get("completed_learning").collect {
        case JsArray(elements) => elements.map(_.convertTo[CompletedLearning])
      }.getOrElse(Nil)
      val riasec = fields.get("riasec").map(_.convertTo[RiasecProfile])

      LearnerContext(
        experienceLevel = experienceLevel,
        interests = interests,
        career = career,
        learningPreferences = learningPreferences,
        availability = availability,
        existingSkills = existingSkills,
        completedLearning = completedLearning,
        riasec = riasec
      )
    }
  }

  implicit val learningGoalRequestFormat: RootJsonFormat[LearningGoalRequest] = jsonFormat2(LearningGoalRequest)
  implicit val learningPathRequestFormat: RootJsonFormat[LearningPathRequest] = jsonFormat2(LearningPathRequest)

  implicit val skillResponseFormat: RootJsonFormat[SkillResponse] = jsonFormat3(SkillResponse)
  implicit val nodeResourceResponseFormat: RootJsonFormat[NodeResourceResponse] = jsonFormat7(NodeResourceResponse)

  implicit val learningPathNodeResponseFormat: RootJsonFormat[LearningPathNodeResponse] = new RootJsonFormat[LearningPathNodeResponse] {
    def write(obj: LearningPathNodeResponse): JsValue = JsObject(
      "id" -> JsString(obj.id),
      "title" -> JsString(obj.title),
      "description" -> JsString(obj.description),
      "skill_ids" -> JsArray(obj.skillIds.map(JsString(_)).toVector),
      "prerequisite_ids" -> JsArray(obj.prerequisiteIds.map(JsString(_)).toVector),
      "estimated_hours" -> JsNumber(obj.estimatedHours),
      "sequence" -> JsNumber(obj.sequence),
      "resources" -> JsArray(obj.resources.map(_.toJson).toVector)
    )

    def read(json: JsValue): LearningPathNodeResponse = {
      val fields = json.asJsObject.fields
      val id = fields.get("id").collect { case JsString(s) => s }.getOrElse("")
      val title = fields.get("title").collect { case JsString(s) => s }.getOrElse("")
      val description = fields.get("description").collect { case JsString(s) => s }.getOrElse("")
      val skillIds = fields.get("skill_ids").collect {
        case JsArray(elems) => elems.collect { case JsString(s) => s }
      }.getOrElse(Nil)
      val prereqIds = fields.get("prerequisite_ids").collect {
        case JsArray(elems) => elems.collect { case JsString(s) => s }
      }.getOrElse(Nil)
      val estHours = fields.get("estimated_hours").collect { case JsNumber(n) => n.toInt }.getOrElse(0)
      val seq = fields.get("sequence").collect { case JsNumber(n) => n.toInt }.getOrElse(1)
      val resources = fields.get("resources").collect {
        case JsArray(elems) => elems.map(_.convertTo[NodeResourceResponse])
      }.getOrElse(Nil)

      LearningPathNodeResponse(id, title, description, skillIds, prereqIds, estHours, seq, resources)
    }
  }

  implicit val milestoneResponseFormat: RootJsonFormat[MilestoneResponse] = new RootJsonFormat[MilestoneResponse] {
    def write(obj: MilestoneResponse): JsValue = JsObject(
      "id" -> JsString(obj.id),
      "title" -> JsString(obj.title),
      "node_ids" -> JsArray(obj.nodeIds.map(JsString(_)).toVector)
    )

    def read(json: JsValue): MilestoneResponse = {
      val fields = json.asJsObject.fields
      val id = fields.get("id").collect { case JsString(s) => s }.getOrElse("")
      val title = fields.get("title").collect { case JsString(s) => s }.getOrElse("")
      val nodeIds = fields.get("node_ids").collect {
        case JsArray(elems) => elems.collect { case JsString(s) => s }
      }.getOrElse(Nil)

      MilestoneResponse(id, title, nodeIds)
    }
  }

  implicit val learningPathResponseFormat: RootJsonFormat[LearningPathResponse] = new RootJsonFormat[LearningPathResponse] {
    def write(obj: LearningPathResponse): JsValue = JsObject(
      "title" -> JsString(obj.title),
      "description" -> JsString(obj.description),
      "estimated_hours" -> JsNumber(obj.estimatedHours),
      "skills" -> JsArray(obj.skills.map(_.toJson).toVector),
      "nodes" -> JsArray(obj.nodes.map(_.toJson).toVector),
      "milestones" -> JsArray(obj.milestones.map(_.toJson).toVector)
    )

    def read(json: JsValue): LearningPathResponse = {
      val fields = json.asJsObject.fields
      val title = fields.get("title").collect { case JsString(s) => s }.getOrElse("")
      val description = fields.get("description").collect { case JsString(s) => s }.getOrElse("")
      val estimatedHours = fields.get("estimated_hours").collect { case JsNumber(n) => n.toInt }.getOrElse(0)
      val skills = fields.get("skills").collect {
        case JsArray(elements) => elements.map(_.convertTo[SkillResponse])
      }.getOrElse(Nil)
      val nodes = fields.get("nodes").collect {
        case JsArray(elements) => elements.map(_.convertTo[LearningPathNodeResponse])
      }.getOrElse(Nil)
      val milestones = fields.get("milestones").collect {
        case JsArray(elements) => elements.map(_.convertTo[MilestoneResponse])
      }.getOrElse(Nil)

      LearningPathResponse(title, description, estimatedHours, skills, nodes, milestones)
    }
  }
}
