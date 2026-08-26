package com.hades.schemas

import org.junit.runner.RunWith
import org.scalatest.matchers.should.Matchers
import org.scalatest.wordspec.AnyWordSpec
import org.scalatestplus.junit.JUnitRunner
import spray.json._
import com.hades.schemas.LearningPathJsonProtocol._

@RunWith(classOf[JUnitRunner])
class JsonSerializationSpec extends AnyWordSpec with Matchers {

  "LearningPathJsonProtocol" should {

    "serialize LearningPathRequest to exact snake_case JSON payload contract" in {
      val request = LearningPathRequest(
        learner = LearnerContext(
          experienceLevel = "beginner",
          interests = Seq("Artificial Intelligence", "Python", "Mathematics"),
          career = CareerContext(targetRole = "Machine Learning Engineer"),
          learningPreferences = Seq("hands_on", "video", "project_based"),
          availability = LearningAvailability(minutesPerDay = 60, daysPerWeek = 5),
          existingSkills = Seq(
            SkillConfidence("Python", 0.8),
            SkillConfidence("Mathematics", 0.6)
          ),
          completedLearning = Seq(
            CompletedLearning("Python Basics", "course")
          ),
          riasec = Some(RiasecProfile(0.72, 0.87, 0.41, 0.32, 0.55, 0.28))
        ),
        goal = LearningGoalRequest(
          title = "Learn Machine Learning Fundamentals",
          description = "Build the foundational knowledge required to start learning machine learning."
        )
      )

      val json = request.toJson
      val fields = json.asJsObject.fields

      fields should contain key "learner"
      fields should contain key "goal"

      val learnerObj = fields("learner").asJsObject.fields
      learnerObj("experience_level") shouldBe JsString("beginner")
      learnerObj("interests") shouldBe JsArray(JsString("Artificial Intelligence"), JsString("Python"), JsString("Mathematics"))
      learnerObj("learning_preferences") shouldBe JsArray(JsString("hands_on"), JsString("video"), JsString("project_based"))

      val careerObj = learnerObj("career").asJsObject.fields
      careerObj("target_role") shouldBe JsString("Machine Learning Engineer")

      val availabilityObj = learnerObj("availability").asJsObject.fields
      availabilityObj("minutes_per_day") shouldBe JsNumber(60)
      availabilityObj("days_per_week") shouldBe JsNumber(5)

      val existingSkills = learnerObj("existing_skills").asInstanceOf[JsArray].elements
      existingSkills should have size 2
      existingSkills.head.asJsObject.fields("name") shouldBe JsString("Python")
      existingSkills.head.asJsObject.fields("confidence") shouldBe JsNumber(0.8)

      val completedLearning = learnerObj("completed_learning").asInstanceOf[JsArray].elements
      completedLearning should have size 1
      completedLearning.head.asJsObject.fields("title") shouldBe JsString("Python Basics")
      completedLearning.head.asJsObject.fields("type") shouldBe JsString("course")

      val riasecObj = learnerObj("riasec").asJsObject.fields
      riasecObj("realistic") shouldBe JsNumber(0.72)
      riasecObj("investigative") shouldBe JsNumber(0.87)

      val goalObj = fields("goal").asJsObject.fields
      goalObj("title") shouldBe JsString("Learn Machine Learning Fundamentals")
      goalObj("description") shouldBe JsString("Build the foundational knowledge required to start learning machine learning.")
    }

    "deserialize placeholder LearningPathResponse JSON from Python AI service" in {
      val jsonString =
        """{
          |  "title": "Machine Learning Engineer Roadmap",
          |  "description": "A personalized learning path for the learner.",
          |  "estimated_hours": 100,
          |  "skills": [
          |    { "id": "s1", "name": "Python", "difficulty": "beginner" }
          |  ],
          |  "milestones": [
          |    { "id": "m1", "title": "Setup Environment" }
          |  ]
          |}""".stripMargin

      val response = jsonString.parseJson.convertTo[LearningPathResponse]

      response.title shouldBe "Machine Learning Engineer Roadmap"
      response.description shouldBe "A personalized learning path for the learner."
      response.estimatedHours shouldBe 100
      response.skills should have size 1
      response.skills.head shouldBe SkillResponse("s1", "Python", "beginner")
      response.milestones should have size 1
      response.milestones.head shouldBe MilestoneResponse("m1", "Setup Environment")
    }
  }
}
