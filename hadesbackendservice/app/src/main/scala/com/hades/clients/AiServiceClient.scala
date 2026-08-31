package com.hades.clients

import org.apache.pekko.actor.typed.ActorSystem
import org.apache.pekko.http.scaladsl.Http
import org.apache.pekko.http.scaladsl.model._
import org.apache.pekko.http.scaladsl.unmarshalling.Unmarshal
import com.hades.errors.{AiServiceException, AiServiceUnavailableException}
import com.hades.schemas.LearningPathJsonProtocol._
import com.hades.schemas._
import spray.json._

import scala.concurrent.{ExecutionContext, Future}
import scala.util.Try

trait AiServiceClient {
  def generateLearningPath(
    request: LearningPathRequest
  ): Future[LearningPathResponse]

  def chat(
    message: String,
    context: String
  ): Future[String]
}

class HttpAiServiceClient(baseUrl: String)(implicit system: ActorSystem[_])
  extends AiServiceClient {

  private implicit val ec: ExecutionContext = system.executionContext
  private val endpoint = s"${baseUrl.stripSuffix("/")}/internal/ai/generate-learning-path"



  private def parseOrchestrationOrLegacyResponse(body: String, request: LearningPathRequest): LearningPathResponse = {
    val jsObj = Try(body.parseJson.asJsObject).getOrElse(
      throw new AiServiceException(500, s"Invalid AI service JSON response: Unable to parse JSON")
    )

    if (jsObj.fields.contains("status") && jsObj.fields.contains("current_chunk")) {
      val status = jsObj.fields.get("status").collect { case JsString(s) => s }.getOrElse("")
      val chunkOpt = jsObj.fields.get("current_chunk").filterNot(_ == JsNull)
      val activeTopic = jsObj.fields.get("active_topic").collect { case JsString(s) => s }.getOrElse("")

      if (chunkOpt.isDefined && status != "FAILED") {
        val chunkObj = chunkOpt.get.asJsObject
        val targetRole = if (request != null && request.learner != null && request.learner.career != null && request.learner.career.targetRole.nonEmpty) {
          request.learner.career.targetRole
        } else "Senior Distributed Systems Engineer"

        val title = chunkObj.fields.get("title").orElse(chunkObj.fields.get("chunk_title")).collect { case JsString(s) => s }
          .getOrElse(s"Personalized Roadmap: $targetRole")

        // 1. Check if chunk has structured milestones with modules (Python RoadmapChunk contract)
        val rawMilestones = chunkObj.fields.get("milestones").collect {
          case JsArray(elems) => elems.map(_.asJsObject)
        }.getOrElse(Vector.empty)

        // 2. Check if chunk has legacy nodes directly
        val rawNodes = chunkObj.fields.get("nodes").collect {
          case JsArray(elems) => elems.map(_.asJsObject)
        }.getOrElse(Vector.empty)

        // 3. Check if chunk has flat topics list
        val flatTopics = chunkObj.fields.get("topics").collect {
          case JsArray(elems) => elems.collect { case JsString(s) => s }
        }.getOrElse(Vector.empty)

        val activeResourcesOpt = jsObj.fields.get("active_resources").filterNot(_ == JsNull).collect { case o: JsObject => o }
        val parsedResources: Seq[NodeResourceResponse] = activeResourcesOpt.map { resObj =>
          val ytList = resObj.fields.get("youtube_resources").collect {
            case JsArray(elems) => elems.collect { case item: JsObject =>
              val rId = item.fields.get("resource_id").orElse(item.fields.get("id")).collect { case JsString(s) => s }.getOrElse(s"res-yt-${java.util.UUID.randomUUID().toString.take(6)}")
              val rTitle = item.fields.get("title").collect { case JsString(s) => s }.getOrElse("Video Tutorial")
              val rUrl = item.fields.get("url").collect { case JsString(s) => s }.getOrElse("")
              val rType = item.fields.get("resource_type").collect { case JsString(s) => s }.getOrElse("video")
              val rSource = item.fields.get("source").collect { case JsString(s) => s }.getOrElse("YouTube")
              val rDesc = item.fields.get("description").collect { case JsString(s) => s }
              val rEst = item.fields.get("estimated_time").collect { case JsString(s) => s }
              NodeResourceResponse(rId, rTitle, rUrl, rType, rSource, rDesc, rEst)
            }
          }.getOrElse(Vector.empty)

          val genList = resObj.fields.get("general_resources").collect {
            case JsArray(elems) => elems.collect { case item: JsObject =>
              val rId = item.fields.get("resource_id").orElse(item.fields.get("id")).collect { case JsString(s) => s }.getOrElse(s"res-gen-${java.util.UUID.randomUUID().toString.take(6)}")
              val rTitle = item.fields.get("title").collect { case JsString(s) => s }.getOrElse("Technical Documentation")
              val rUrl = item.fields.get("url").collect { case JsString(s) => s }.getOrElse("")
              val rType = item.fields.get("resource_type").collect { case JsString(s) => s }.getOrElse("article")
              val rSource = item.fields.get("source").collect { case JsString(s) => s }.getOrElse("Documentation")
              val rDesc = item.fields.get("description").collect { case JsString(s) => s }
              val rEst = item.fields.get("estimated_time").collect { case JsString(s) => s }
              NodeResourceResponse(rId, rTitle, rUrl, rType, rSource, rDesc, rEst)
            }
          }.getOrElse(Vector.empty)

          ytList ++ genList
        }.getOrElse(Vector.empty)

        val (nodes, milestones, skills) = if (rawMilestones.nonEmpty) {
          var nodeAcc = Vector.empty[LearningPathNodeResponse]
          var skillAcc = Vector.empty[SkillResponse]
          var milestoneAcc = Vector.empty[MilestoneResponse]
          var globalSeq = 1

          rawMilestones.zipWithIndex.foreach { case (mObj, mIdx) =>
            val mId = mObj.fields.get("milestone_id").orElse(mObj.fields.get("id")).collect { case JsString(s) => s }.getOrElse(s"ms-${mIdx + 1}")
            val mTitle = mObj.fields.get("title").collect { case JsString(s) => s }.getOrElse(s"Phase ${mIdx + 1}")
            val mPrereqs = mObj.fields.get("prerequisite_skills").collect {
              case JsArray(elems) => elems.collect { case JsString(s) => s }
            }.getOrElse(Vector.empty)

            mPrereqs.foreach { sk =>
              if (!skillAcc.exists(_.name == sk)) {
                skillAcc = skillAcc :+ SkillResponse(s"sk-${skillAcc.size + 1}", sk, "Intermediate")
              }
            }

            val mModules = mObj.fields.get("modules").collect {
              case JsArray(elems) => elems.map(_.asJsObject)
            }.getOrElse(Vector.empty)

            val moduleIds = if (mModules.nonEmpty) {
              mModules.map { modObj =>
                val modId = modObj.fields.get("module_id").orElse(modObj.fields.get("id")).collect { case JsString(s) => s }.getOrElse(s"node-$globalSeq")
                val modTitle = modObj.fields.get("title").collect { case JsString(s) => s }.getOrElse(s"Module $globalSeq")
                val modDesc = modObj.fields.get("description").collect { case JsString(s) => s }.getOrElse("")
                val modHours = modObj.fields.get("estimated_hours").collect {
                  case JsNumber(n) => n.toInt
                }.getOrElse(5)

                val modTopics = modObj.fields.get("topics").collect {
                  case JsArray(elems) => elems.collect { case JsString(s) => s }
                }.getOrElse(Vector.empty)

                modTopics.foreach { t =>
                  if (!skillAcc.exists(_.name == t)) {
                    skillAcc = skillAcc :+ SkillResponse(s"sk-${skillAcc.size + 1}", t, "Intermediate")
                  }
                }

                val prereqIds = if (globalSeq > 1) Seq(s"node-${globalSeq - 1}") else Nil
                val nodeResp = LearningPathNodeResponse(
                  id = modId,
                  title = modTitle,
                  description = modDesc,
                  skillIds = if (modTopics.nonEmpty) modTopics.take(3) else Seq(s"sk-$globalSeq"),
                  prerequisiteIds = prereqIds,
                  estimatedHours = modHours,
                  sequence = globalSeq,
                  resources = if (globalSeq == 1) parsedResources else parsedResources.take(2)
                )
                nodeAcc = nodeAcc :+ nodeResp
                globalSeq += 1
                modId
              }
            } else {
              val fallbackId = s"node-$globalSeq"
              val nodeResp = LearningPathNodeResponse(
                id = fallbackId,
                title = mTitle,
                description = mTitle,
                skillIds = Seq(s"sk-$globalSeq"),
                prerequisiteIds = if (globalSeq > 1) Seq(s"node-${globalSeq - 1}") else Nil,
                estimatedHours = 8,
                sequence = globalSeq,
                resources = parsedResources
              )
              nodeAcc = nodeAcc :+ nodeResp
              globalSeq += 1
              Vector(fallbackId)
            }

            milestoneAcc = milestoneAcc :+ MilestoneResponse(mId, mTitle, moduleIds)
          }

          (nodeAcc, milestoneAcc, skillAcc)
        } else if (rawNodes.nonEmpty) {
          val parsedNodes = rawNodes.zipWithIndex.map { case (nodeObj, idx) =>
            val id = nodeObj.fields.get("id").collect { case JsString(s) => s }.getOrElse(s"node-${idx + 1}")
            val nTitle = nodeObj.fields.get("title").collect { case JsString(s) => s }.getOrElse(s"Module ${idx + 1}")
            val nDesc = nodeObj.fields.get("description").collect { case JsString(s) => s }.getOrElse("")
            val nHours = nodeObj.fields.get("estimated_hours").collect { case JsNumber(n) => n.toInt }.getOrElse(5)

            LearningPathNodeResponse(
              id = id,
              title = nTitle,
              description = nDesc,
              skillIds = Seq(s"sk-${idx + 1}"),
              prerequisiteIds = if (idx > 0) Seq(s"node-$idx") else Nil,
              estimatedHours = nHours,
              sequence = idx + 1,
              resources = if (idx == 0) parsedResources else parsedResources.take(2)
            )
          }

          val parsedSkills = chunkObj.fields.get("prerequisites_addressed").collect {
            case JsArray(elems) => elems.collect { case JsString(s) => s }
          }.getOrElse(Seq("Core Concepts", "Advanced Tools")).zipWithIndex.map { case (skName, idx) =>
            SkillResponse(s"sk-${idx + 1}", skName, "Intermediate")
          }

          val parsedMilestones = Seq(
            MilestoneResponse("ms-1", s"Phase 1: ${parsedNodes.headOption.map(_.title).getOrElse("Foundations")}", parsedNodes.map(_.id))
          )

          (parsedNodes, parsedMilestones, parsedSkills)
        } else if (flatTopics.nonEmpty) {
          val parsedNodes = flatTopics.zipWithIndex.map { case (tName, idx) =>
            LearningPathNodeResponse(
              id = s"node-${idx + 1}",
              title = tName,
              description = s"Master $tName competency and hands-on deliverables.",
              skillIds = Seq(s"sk-${idx + 1}"),
              prerequisiteIds = if (idx > 0) Seq(s"node-$idx") else Nil,
              estimatedHours = 6,
              sequence = idx + 1,
              resources = if (idx == 0) parsedResources else parsedResources.take(2)
            )
          }

          val parsedSkills = flatTopics.zipWithIndex.map { case (tName, idx) =>
            SkillResponse(s"sk-${idx + 1}", tName, "Intermediate")
          }

          val parsedMilestones = Seq(
            MilestoneResponse("ms-1", s"Phase 1: ${parsedNodes.headOption.map(_.title).getOrElse("Core Topics")}", parsedNodes.map(_.id))
          )

          (parsedNodes, parsedMilestones, parsedSkills)
        } else {
          val fallbackNode = LearningPathNodeResponse("node-1", "Foundations", "Core Concepts", Seq("sk-1"), Nil, 10, 1, parsedResources)
          (Vector(fallbackNode), Vector(MilestoneResponse("ms-1", "Phase 1: Foundations", Seq("node-1"))), Vector(SkillResponse("sk-1", "Core Concepts", "Beginner")))
        }

        val totalHours = if (nodes.nonEmpty) nodes.map(_.estimatedHours).sum else 40

        LearningPathResponse(
          title = title,
          description = s"AI-orchestrated personalized path for $targetRole. Active topic: $activeTopic",
          estimatedHours = totalHours,
          skills = if (skills.nonEmpty) skills else Seq(SkillResponse("sk-1", "Core AI", "Intermediate")),
          nodes = nodes,
          milestones = milestones
        )
      } else {
        val parsed = Try(body.parseJson.convertTo[LearningPathResponse]).toOption
        if (parsed.exists(p => p.title.nonEmpty && p.estimatedHours > 0)) {
          parsed.get
        } else {
          val rationale = jsObj.fields.get("rationale").collect { case JsString(s) => s }.getOrElse("Unknown AI service error")
          throw new AiServiceException(500, s"AI Orchestration failed: $rationale")
        }
      }
    } else {
      Try(body.parseJson.convertTo[LearningPathResponse]) match {
        case scala.util.Success(lp) => lp
        case scala.util.Failure(err) =>
          throw new AiServiceException(500, s"Invalid AI service JSON response: ${err.getMessage}")
      }
    }
  }

  override def generateLearningPath(request: LearningPathRequest): Future[LearningPathResponse] = {
    val orchestrateEndpoint = s"${baseUrl.stripSuffix("/")}/ai/orchestrate"
    val targetRole = if (request != null && request.learner != null && request.learner.career != null && request.learner.career.targetRole.nonEmpty) {
      request.learner.career.targetRole
    } else if (request != null && request.goal != null && request.goal.title.nonEmpty) {
      request.goal.title
    } else "Machine Learning"

    val targetGoal = if (request != null && request.goal != null && request.goal.title.nonEmpty) {
      request.goal.title
    } else targetRole

    val expLevel = if (request != null && request.learner != null && request.learner.experienceLevel.nonEmpty) {
      request.learner.experienceLevel
    } else "intermediate"

    val hoursPerWeek = if (request != null && request.learner != null && request.learner.availability != null) {
      request.learner.availability.daysPerWeek * (request.learner.availability.minutesPerDay / 60.0)
    } else 10.0

    val interests = if (request != null && request.learner != null && request.learner.interests.nonEmpty) {
      request.learner.interests
    } else Seq.empty[String]

    val learnerId = if (request != null && request.learner != null && request.learner.career != null && request.learner.career.targetRole.nonEmpty) {
      s"learner_${request.learner.career.targetRole.toLowerCase.replaceAll("[^a-z0-9]", "_")}"
    } else if (request != null && request.goal != null && request.goal.title.nonEmpty) {
      s"learner_${request.goal.title.toLowerCase.replaceAll("[^a-z0-9]", "_")}"
    } else {
      s"learner_${java.util.UUID.randomUUID().toString.take(8)}"
    }

    val orchPayload = JsObject(
      "learner_id" -> JsString(learnerId),
      "event" -> JsString("INITIAL_SESSION"),
      "target_goal" -> JsString(targetGoal),
      "context" -> JsObject(
        "session_id" -> JsString(s"sess-${java.util.UUID.randomUUID().toString.take(8)}"),
        "experience_level" -> JsString(expLevel),
        "available_hours_per_week" -> JsNumber(hoursPerWeek),
        "interests" -> JsArray(interests.map(JsString(_)).toVector)
      )
    ).compactPrint

    val httpRequest = HttpRequest(
      method = HttpMethods.POST,
      uri = orchestrateEndpoint,
      entity = HttpEntity(ContentTypes.`application/json`, orchPayload)
    )

    Http()
      .singleRequest(httpRequest)
      .flatMap { response =>
        if (response.status.isSuccess()) {
          Unmarshal(response.entity).to[String].flatMap { body =>
            Future {
              parseOrchestrationOrLegacyResponse(body, request)
            }.recoverWith { case parseError: Throwable =>
              parseError match {
                case aiEx: AiServiceException => Future.failed(aiEx)
                case other => Future.failed(new AiServiceException(response.status.intValue(), s"Invalid AI service JSON response: ${other.getMessage}"))
              }
            }
          }
        } else {
          Unmarshal(response.entity).to[String].flatMap { errorBody =>
            Future.failed(new AiServiceException(response.status.intValue(), s"AI service error (${response.status.intValue()}): $errorBody"))
          }
        }
      }
      .recoverWith { case cause: Throwable =>
        cause match {
          case ex: AiServiceException => Future.failed(ex)
          case ex: AiServiceUnavailableException => Future.failed(ex)
          case other => Future.failed(new AiServiceUnavailableException("The AI service is currently unavailable.", other))
        }
      }
  }

  override def chat(message: String, context: String): Future[String] = {
    val assistantEndpoint = s"${baseUrl.stripSuffix("/")}/ai/assistant/chat"
    val payload = JsObject(
      "learner_id" -> JsString("learner-session-user"),
      "message" -> JsString(if (context.nonEmpty) s"Context: $context\n\nQuestion: $message" else message),
      "session_id" -> JsString("hades-coach-session")
    ).compactPrint

    val httpRequest = HttpRequest(
      method = HttpMethods.POST,
      uri = assistantEndpoint,
      entity = HttpEntity(ContentTypes.`application/json`, payload)
    )

    Http()
      .singleRequest(httpRequest)
      .flatMap { response =>
        if (response.status.isSuccess()) {
          Unmarshal(response.entity).to[String].map { body =>
            val js = Try(body.parseJson.asJsObject).toOption
            js.flatMap(_.fields.get("message")).collect { case JsString(m) => m }
              .orElse(js.flatMap(_.fields.get("reply")).collect { case JsString(r) => r })
              .getOrElse(body)
          }
        } else {
          val legacyChatEndpoint = s"${baseUrl.stripSuffix("/")}/internal/ai/chat"
          val legacyPayload = JsObject("message" -> JsString(message), "context" -> JsString(context)).compactPrint
          Http().singleRequest(HttpRequest(method = HttpMethods.POST, uri = legacyChatEndpoint, entity = HttpEntity(ContentTypes.`application/json`, legacyPayload)))
            .flatMap { legacyResp =>
              if (legacyResp.status.isSuccess()) {
                Unmarshal(legacyResp.entity).to[String].map { body =>
                  Try(body.parseJson.asJsObject.fields.get("reply").collect { case JsString(r) => r })
                    .toOption.flatten.getOrElse(body)
                }
              } else {
                Unmarshal(legacyResp.entity).to[String].flatMap { errorBody =>
                  Future.failed(new AiServiceException(legacyResp.status.intValue(), s"AI assistant error (${legacyResp.status.intValue()}): $errorBody"))
                }
              }
            }
        }
      }
      .recoverWith { case cause: Throwable =>
        cause match {
          case ex: AiServiceException => Future.failed(ex)
          case ex: AiServiceUnavailableException => Future.failed(ex)
          case other => Future.failed(new AiServiceUnavailableException("The AI service is currently unavailable.", other))
        }
      }
  }
}
