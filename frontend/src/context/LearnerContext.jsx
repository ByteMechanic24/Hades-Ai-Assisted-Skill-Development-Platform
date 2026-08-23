import React, { createContext, useContext, useState } from 'react';
import {
  initialLearnerProfile,
  initialLearningGoal,
  initialLearningPath,
  initialSkills,
  initialResources,
  initialMilestones,
  initialAssistantMessages,
  interactiveRoadmapData
} from '../mock/mockData';

const LearnerContext = createContext(null);

export function LearnerProvider({ children }) {
  const [profile, setProfile] = useState(initialLearnerProfile);
  const [goal, setGoal] = useState(initialLearningGoal);
  const [path, setPath] = useState(initialLearningPath);
  const [roadmap, setRoadmap] = useState(interactiveRoadmapData);
  const [skills, setSkills] = useState(initialSkills);
  const [resources, setResources] = useState(initialResources);
  const [milestones, setMilestones] = useState(initialMilestones);
  const [assistantMessages, setAssistantMessages] = useState(initialAssistantMessages);
  const [selectedBranchNode, setSelectedBranchNode] = useState(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isGeneratingPath, setIsGeneratingPath] = useState(false);
  const [hasGeneratedRoadmap, setHasGeneratedRoadmap] = useState(() => {
    return localStorage.getItem('hades_has_generated_roadmap') === 'true';
  });
  const [recentEvents, setRecentEvents] = useState([
    { id: "ev_1", type: "NODE_STATUS_UPDATED", title: "Linear Algebra & Dot Products (Done)", timestamp: "2 hours ago" },
    { id: "ev_2", type: "RESOURCE_LAUNCHED", title: "pgvector HNSW Lab (Rank #1)", timestamp: "Yesterday" },
    { id: "ev_3", type: "PATH_ADAPTED", title: "AI Re-weighted YouTube Playlists", timestamp: "Yesterday" }
  ]);

  const generateRoadmapForRole = (roleQuery) => {
    if (!roleQuery || !roleQuery.trim()) return;
    const cleanRole = roleQuery.trim();
    
    setProfile(prev => ({
      ...prev,
      targetRole: cleanRole
    }));

    setGoal(prev => ({
      ...prev,
      title: `Master ${cleanRole} Roadmap`,
      targetRole: cleanRole
    }));

    setRoadmap(prev => ({
      ...prev,
      title: `${cleanRole} Interactive Roadmap`,
      rootTopic: cleanRole
    }));

    setHasGeneratedRoadmap(true);
    try {
      localStorage.setItem('hades_has_generated_roadmap', 'true');
    } catch (e) {
      console.warn("Storage error:", e);
    }

    recordProgressEvent("ROADMAP_GENERATED", {
      title: `Generated roadmap for ${cleanRole}`,
      role: cleanRole
    });
  };

  const recordProgressEvent = (eventType, payload) => {
    const newEvent = {
      id: `ev_${Date.now()}`,
      type: eventType,
      title: payload?.title || eventType,
      timestamp: "Just now",
      data: payload
    };
    setRecentEvents(prev => [newEvent, ...prev.slice(0, 9)]);
    console.log(`[HADES Event Bus] ${eventType}:`, payload);
  };

  const updateProfile = (newProfile) => {
    setProfile(prev => ({ ...prev, ...newProfile }));
    recordProgressEvent("PROFILE_UPDATED", { title: "Learner Profile Updated" });
  };

  const updateGoal = (newGoal) => {
    setGoal(prev => ({ ...prev, ...newGoal }));
    recordProgressEvent("GOAL_UPDATED", { title: `Goal set: ${newGoal.title}` });
  };

  const dismissAdaptationBanner = () => {
    setPath(prev => ({
      ...prev,
      pathAdaptationBanner: { ...prev.pathAdaptationBanner, visible: false }
    }));
  };

  const completeNode = (phaseId, nodeId) => {
    setPath(prev => {
      const newPhases = prev.phases.map(ph => {
        if (ph.id !== phaseId) return ph;
        const newNodes = ph.nodes.map(node => {
          if (node.id === nodeId) {
            return { ...node, status: 'completed' };
          }
          return node;
        });
        const completedCount = newNodes.filter(n => n.status === 'completed').length;
        const phaseProgress = Math.round((completedCount / newNodes.length) * 100);
        return { ...ph, nodes: newNodes, progress: phaseProgress };
      });
      return { ...prev, phases: newPhases, overallProgress: Math.min(100, prev.overallProgress + 8) };
    });
    recordProgressEvent("NODE_COMPLETED", { title: `Completed step: ${nodeId}` });
  };

  // Update status of any branch in roadmap.sh tree (learning | done | skip | pending)
  const updateBranchStatus = (mainNodeId, branchId, newStatus) => {
    setRoadmap(prev => {
      const newMainNodes = prev.mainNodes.map(mNode => {
        if (mNode.id !== mainNodeId && !mNode.branches?.some(b => b.id === branchId)) return mNode;
        const newBranches = mNode.branches.map(br => {
          if (br.id === branchId) {
            return { ...br, status: newStatus };
          }
          return br;
        });

        const allDone = newBranches.every(b => b.status === 'done' || b.status === 'skip');
        const anyLearning = newBranches.some(b => b.status === 'learning');
        const updatedMainStatus = allDone ? 'done' : anyLearning ? 'learning' : mNode.status;

        return { ...mNode, status: updatedMainStatus, branches: newBranches };
      });

      return { ...prev, mainNodes: newMainNodes };
    });

    setSelectedBranchNode(prev => {
      if (prev && prev.id === branchId) {
        return { ...prev, status: newStatus };
      }
      return prev;
    });

    recordProgressEvent("BRANCH_STATUS_CHANGED", { 
      title: `Node status: ${newStatus.toUpperCase()}`,
      branchId,
      status: newStatus
    });
  };

  const toggleSaveResource = (resourceId) => {
    setResources(prev =>
      prev.map(r => r.id === resourceId ? { ...r, isSaved: !r.isSaved } : r)
    );
    const item = resources.find(r => r.id === resourceId);
    recordProgressEvent("RESOURCE_SAVED", { title: item?.title || "Resource Saved" });
  };

  const updateResourceProgress = (resourceId, newProgress) => {
    setResources(prev =>
      prev.map(r => r.id === resourceId ? { ...r, progress: newProgress } : r)
    );
    if (newProgress === 100) {
      recordProgressEvent("RESOURCE_COMPLETED", { title: `Finished resource: ${resourceId}` });
    }
  };

  const sendAssistantMessage = (userText) => {
    if (!userText || !userText.trim()) return;
    
    const userMsg = {
      id: `msg_${Date.now()}`,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: userText
    };

    setAssistantMessages(prev => [...prev, userMsg]);
    recordProgressEvent("ASSISTANT_QUERY", { title: userText.slice(0, 30) });

    setTimeout(() => {
      let aiReply = "I'm monitoring your active roadmap. Based on your target role as an **Autonomous AI Systems Engineer**, here is what you need to know:";
      
      const lower = userText.toLowerCase();
      if (lower.includes("cosine") || lower.includes("similarity")) {
        aiReply = "📐 **Cosine Similarity vs Dot Product:**\n\n- **Dot Product**: Combines both vector magnitude (length) and angle.\n- **Cosine Similarity**: Normalizes vector lengths to 1, measuring purely directional semantic angle. Perfect for text embeddings where document length shouldn't bias the score!";
      } else if (lower.includes("hnsw") || lower.includes("index") || lower.includes("vector")) {
        aiReply = "⚡ **Why HNSW (Hierarchical Navigable Small World) Indexing is Ranked #1:**\n\nHNSW creates multi-layered skip-list graphs in vector space. Instead of comparing a query against 1,000,000 vectors (which takes 200ms), it jumps through sparse top layers and zooms in with logarithmic O(log N) complexity (~3ms latency).";
      } else if (lower.includes("react") || lower.includes("agent") || lower.includes("loop")) {
        aiReply = "🤖 **ReAct (Reason + Act) Loop Explained:**\n\n1. **Thought**: The model reasons over the user's intent.\n2. **Action**: The model outputs a JSON tool call.\n3. **Observation**: Backend executes tool & feeds result back.\n4. **Repeat**: Until the answer is fully synthesized.";
      } else if (lower.includes("youtube") || lower.includes("course") || lower.includes("playlist")) {
        aiReply = "📺 **Top Ranked YouTube Learning Materials:**\n\n1. **3Blue1Brown**: Linear Algebra & Neural Networks Visual Series\n2. **Hussein Nasser**: PostgreSQL pgvector & Database Internals\n3. **LangChain & Agno**: Multi-Agent Workflows & Tool Routing Architecture";
      } else {
        aiReply = `💡 **AI Roadmap Guidance on "${userText}":**\n\nTo master this concept effectively, focus on practical implementation before theoretical optimization. Check the ranked YouTube playlist on this node, and test your comprehension by building a minimal prototype!`;
      }

      const botMsg = {
        id: `msg_${Date.now() + 1}`,
        sender: "assistant",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: aiReply
      };
      setAssistantMessages(prev => [...prev, botMsg]);
    }, 400);
  };

  // Open the slideover AI assistant and optionally send an initial question
  const openAssistant = (initialPrompt = null) => {
    setIsAssistantOpen(true);
    if (initialPrompt && initialPrompt.trim()) {
      sendAssistantMessage(initialPrompt);
    }
  };

  const closeAssistant = () => {
    setIsAssistantOpen(false);
  };

  const allBranches = roadmap?.mainNodes?.flatMap(m => m.branches || []) || [];
  const doneBranchesCount = allBranches.filter(b => b.status === 'done').length;
  const roadmapProgressPercentage = allBranches.length > 0
    ? Math.round((doneBranchesCount / allBranches.length) * 100)
    : 45;

  return (
    <LearnerContext.Provider value={{
      profile,
      updateProfile,
      goal,
      updateGoal,
      path,
      setPath,
      completeNode,
      dismissAdaptationBanner,
      roadmap,
      roadmapProgressPercentage,
      updateBranchStatus,
      selectedBranchNode,
      setSelectedBranchNode,
      skills,
      resources,
      toggleSaveResource,
      updateResourceProgress,
      milestones,
      assistantMessages,
      sendAssistantMessage,
      isAssistantOpen,
      setIsAssistantOpen,
      openAssistant,
      closeAssistant,
      recentEvents,
      recordProgressEvent,
      isGeneratingPath,
      hasGeneratedRoadmap,
      setHasGeneratedRoadmap,
      generateRoadmapForRole
    }}>
      {children}
    </LearnerContext.Provider>
  );
}

export function useLearner() {
  const context = useContext(LearnerContext);
  if (!context) {
    throw new Error('useLearner must be used within a LearnerProvider');
  }
  return context;
}
