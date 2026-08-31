import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  fetchDashboard as apiFetchDashboard,
  fetchProfile as apiFetchProfile,
  updateProfile as apiUpdateProfile,
  fetchResources as apiFetchResources,
  generateLearningPath as apiGenerateLearningPath,
  fetchActiveLearningPath as apiFetchActiveLearningPath,
  fetchLearningPathsHistory as apiFetchLearningPathsHistory,
  fetchSkills as apiFetchSkills,
  fetchMilestones as apiFetchMilestones,
  fetchProgressStats as apiFetchProgressStats,
  fetchProgressEvents as apiFetchProgressEvents,
  recordProgressEvent as apiRecordProgressEvent,
  sendChatMessage as apiSendChatMessage,
  submitOnboarding as apiSubmitOnboarding,
  createGoal as apiCreateGoal,
  fetchGoal as apiFetchGoal,
} from '../api/learner';
import { getToken } from '../api/client';

const LearnerContext = createContext(null);

const PATH_STORAGE_KEY = 'hades_active_learning_path';
const ROADMAP_STORAGE_KEY = 'hades_active_roadmap';
const ALL_ROADMAPS_STORAGE_KEY = 'hades_all_roadmaps';
const EVENTS_STORAGE_KEY = 'hades_recent_events';

function loadCachedJson(key, fallback) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function saveCachedJson(key, data) {
  try {
    if (data) localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn(`[HADES] Could not cache ${key}`, e);
  }
}

const defaultProfile = {
  id: '',
  name: 'Learner',
  email: '',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  currentRole: 'Computer Science Learner',
  targetRole: 'Autonomous AI Systems Engineer',
  educationLevel: 'Undergraduate / Tech Enthusiast',
  experienceLevel: 'Intermediate',
  interests: ['Generative AI', 'Agentic Workflows', 'Vector Databases', 'FastAPI'],
  learningPreferences: {
    format: ['Hands-on Projects', 'Interactive Labs'],
    pace: 'Accelerated',
    weeklyHours: 14,
  },
};

const defaultGoal = {
  id: '',
  title: 'Master Autonomous AI Systems Engineering',
  targetRole: 'Autonomous AI Systems Engineer',
  description: 'AI-curated learning path based on your goals and prerequisites.',
  timeframeWeeks: 12,
  completedWeeks: 0,
  currentLevel: 'Intermediate',
  targetLevel: 'Production-Ready Specialist',
  status: 'in_progress',
};

const defaultPath = {
  id: '',
  goalId: '',
  title: 'Personalized AI Engineering Roadmap',
  description: 'AI-curated dynamic learning roadmap tailored to your experience and goals.',
  status: 'active',
  overallProgress: 38,
  estimatedHoursLeft: 42,
  pathAdaptationBanner: { visible: false },
  phases: [],
};

const defaultRoadmap = {
  id: '',
  title: 'Personalized AI Roadmap',
  description: 'Step-by-step curriculum with branch nodes, hands-on modules, and deterministic progress gates.',
  rootTopic: 'Autonomous AI Systems Engineer',
  mainNodes: [],
};

const defaultProgressStats = {
  currentStreak: 14,
  longestStreak: 21,
  weeklyHoursLogged: 8.0,
  weeklyHoursTarget: 14.0,
  overallProgressPercent: 38.0,
};

const initialAssistantMessages = [
  {
    id: "msg_welcome",
    sender: "assistant",
    timestamp: "Just now",
    content: "Hi! I'm your HADES AI Coach. I monitor your active roadmap nodes and progress.\n\nAsk me about any concept, prerequisites, or next steps!"
  }
];

export function LearnerProvider({ children }) {
  const [profile, setProfile] = useState(defaultProfile);
  const [goal, setGoal] = useState(defaultGoal);
  const [path, setPath] = useState(() => loadCachedJson(PATH_STORAGE_KEY, defaultPath));
  const [roadmap, setRoadmap] = useState(() => loadCachedJson(ROADMAP_STORAGE_KEY, defaultRoadmap));
  const [skills, setSkills] = useState([]);
  const [resources, setResources] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [progressStats, setProgressStats] = useState(defaultProgressStats);
  const [assistantMessages, setAssistantMessages] = useState(initialAssistantMessages);
  const [selectedBranchNode, setSelectedBranchNode] = useState(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isGeneratingPath, setIsGeneratingPath] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState(null);
  const [hasGeneratedRoadmap, setHasGeneratedRoadmap] = useState(() => {
    return localStorage.getItem('hades_has_generated_roadmap') === 'true';
  });
  const [allRoadmaps, setAllRoadmaps] = useState(() => loadCachedJson(ALL_ROADMAPS_STORAGE_KEY, []));
  const [isRoadmapLibraryOpen, setIsRoadmapLibraryOpen] = useState(false);
  const [recentEvents, setRecentEvents] = useState(() => loadCachedJson(EVENTS_STORAGE_KEY, []));

  // ── Helper: Map backend learning-path nodes → interactive roadmap tree ──
  const mapBackendPathToRoadmap = useCallback((backendPath, targetRole) => {
    if (!backendPath || !backendPath.nodes || backendPath.nodes.length === 0) return null;

    const roleName = targetRole || backendPath.title?.replace('Personalized Roadmap: ', '') || 'AI Systems Engineering';

    const mainNodes = backendPath.nodes.map((node, idx) => {
      const nodeResources = Array.isArray(node.resources) ? node.resources : [];
      const videoResources = nodeResources.filter(r => r.resourceType === 'video' || (r.source && r.source.toLowerCase().includes('youtube')));
      const docResources = nodeResources.filter(r => r.resourceType !== 'video' && !(r.source && r.source.toLowerCase().includes('youtube')));
      const primaryResource = docResources[0] || videoResources[0] || null;

      const mappedVideos = videoResources.length > 0 ? videoResources.map((vr, vIdx) => ({
        id: vr.id || `v_${node.id}_${vIdx + 1}`,
        rank: vIdx + 1,
        title: vr.title || `${node.title} — Comprehensive Guide & Implementation`,
        channel: vr.source || 'YouTube',
        duration: vr.estimatedTime || '45 mins',
        views: '250K views',
        thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80',
        rating: '98% Match',
        url: vr.url || `https://www.youtube.com/results?search_query=${encodeURIComponent(node.title + ' tutorial')}`,
      })) : [
        {
          id: `v_${node.id || idx}_1`,
          rank: 1,
          title: `${node.title} — Comprehensive Guide & Implementation`,
          channel: 'HADES AI Academy',
          duration: '45 mins',
          views: '250K views',
          thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80',
          rating: '98% Match',
          url: `https://www.youtube.com/results?search_query=${encodeURIComponent(node.title + ' full tutorial course')}`,
        },
      ];

      const mappedArticles = docResources.length > 0 ? docResources.map(dr => ({
        title: dr.title,
        duration: dr.estimatedTime || '10 min read',
        url: dr.url || `https://www.google.com/search?q=${encodeURIComponent(dr.title || node.title)}`,
      })) : [
        {
          title: `${node.title} Architecture & Evaluation Benchmarks`,
          duration: '10 min read',
          url: `https://www.google.com/search?q=${encodeURIComponent(node.title + ' architecture guide')}`,
        },
      ];

      return {
        id: node.id || `node-${idx + 1}`,
        title: node.title,
        category: `Stage ${node.sequence || idx + 1}`,
        status: idx === 0 ? 'learning' : 'pending',
        description: node.description,
        branches: [
          {
            id: `branch_${node.id || idx}`,
            title: node.title,
            status: idx === 0 ? 'learning' : 'pending',
            summary: node.description,
            recommendedResource: {
              title: primaryResource ? primaryResource.title : `Deep Dive: ${node.title}`,
              provider: primaryResource ? primaryResource.source : 'HADES Curated Lab & Lecture',
              duration: primaryResource?.estimatedTime || `${node.estimated_hours || 10}h`,
              type: primaryResource?.resourceType || 'Core Concept',
              url: primaryResource?.url || `https://www.google.com/search?q=${encodeURIComponent(node.title + ' documentation tutorial')}`,
            },
            rankedVideos: mappedVideos,
            articles: mappedArticles,
            paidCourses: [],
          },
        ],
      };
    });

    return {
      id: `roadmap_${Date.now()}`,
      title: backendPath.title || `${roleName} Roadmap`,
      description: backendPath.description || 'AI-generated personalized learning path.',
      rootTopic: roleName,
      mainNodes,
    };
  }, []);

  // ── Helper: Map backend learning-path nodes → trackable phases & nodes ──
  const mapBackendPathToPhases = useCallback((backendPath, currentGoalId, targetRole) => {
    if (!backendPath || !backendPath.nodes || backendPath.nodes.length === 0) return null;

    const roleName = targetRole || backendPath.title?.replace('Personalized Roadmap: ', '') || 'AI Systems Engineering';

    const nodes = backendPath.nodes.map((node, idx) => ({
      id: node.id || `node-${idx + 1}`,
      type: 'skill',
      title: node.title,
      status: idx === 0 ? 'in_progress' : 'available',
      estimatedMinutes: (node.estimated_hours || 10) * 60,
      confidenceScore: idx === 0 ? 80 : 50,
      prerequisites: node.prerequisite_ids || (idx > 0 ? [backendPath.nodes[idx - 1].id || `node-${idx}`] : []),
      description: node.description,
    }));

    return {
      id: `path_${Date.now()}`,
      goalId: currentGoalId || 'goal_01',
      title: backendPath.title || `${roleName} Roadmap`,
      description: backendPath.description || 'AI-curated learning path based on your goals and prerequisites.',
      status: 'active',
      overallProgress: 0,
      estimatedHoursLeft: backendPath.estimated_hours || 40,
      pathAdaptationBanner: { visible: false },
      phases: [{
        id: 'phase_1',
        number: 1,
        title: backendPath.title || 'Core Foundations',
        description: backendPath.description || 'Master core concepts and tools.',
        status: 'in_progress',
        progress: 0,
        nodes,
      }],
    };
  }, []);

  // ── API Loader: Skills Competency Matrix (GET /api/skills) ──
  const loadSkills = useCallback(async () => {
    try {
      const data = await apiFetchSkills();
      if (Array.isArray(data) && data.length > 0) {
        setSkills(data);
      }
    } catch (err) {
      console.warn('[HADES] Skills fetch warning:', err);
    }
  }, []);

  // ── API Loader: Milestones Badges (GET /api/milestones) ──
  const loadMilestones = useCallback(async () => {
    if (!getToken()) return;
    try {
      const data = await apiFetchMilestones();
      if (Array.isArray(data) && data.length > 0) {
        setMilestones(data);
      }
    } catch (err) {
      console.warn('[HADES] Milestones fetch warning:', err);
    }
  }, []);

  // ── API Loader: Progress Stats & Streak (GET /api/progress/stats) ──
  const loadProgressStats = useCallback(async () => {
    if (!getToken()) return;
    try {
      const data = await apiFetchProgressStats();
      if (data) {
        setProgressStats({
          currentStreak: data.currentStreak ?? 14,
          longestStreak: data.longestStreak ?? 21,
          weeklyHoursLogged: data.weeklyHoursLogged ?? 8.0,
          weeklyHoursTarget: data.weeklyHoursTarget ?? 14.0,
          overallProgressPercent: data.overallProgressPercent ?? 38.0,
        });
        if (data.overallProgressPercent != null) {
          setPath(prev => ({ ...prev, overallProgress: Math.round(data.overallProgressPercent) }));
        }
      }
    } catch (err) {
      console.warn('[HADES] Progress stats fetch warning:', err);
    }
  }, []);

  // ── API Loader: Activity Event Telemetry (GET /api/progress/events) ──
  const loadProgressEvents = useCallback(async () => {
    if (!getToken()) return;
    try {
      const data = await apiFetchProgressEvents();
      if (Array.isArray(data) && data.length > 0) {
        const formattedEvents = data.map(ev => ({
          id: ev.id,
          type: ev.eventType,
          title: (() => {
            try {
              const p = JSON.parse(ev.payload);
              return p.title || ev.eventType;
            } catch {
              return ev.eventType;
            }
          })(),
          timestamp: ev.createdAt ? new Date(ev.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
          entityId: ev.entityId,
          payload: ev.payload,
        }));
        setRecentEvents(formattedEvents);
        saveCachedJson(EVENTS_STORAGE_KEY, formattedEvents);
      }
    } catch (err) {
      console.warn('[HADES] Progress events fetch warning:', err);
    }
  }, []);

  // ── API Loader: Resources Catalog (GET /api/resources) ──
  const loadResources = useCallback(async (filters = {}) => {
    try {
      const data = await apiFetchResources(filters);
      if (Array.isArray(data) && data.length > 0) {
        setResources(data);
      }
    } catch (err) {
      console.warn('[HADES] Resources fetch warning:', err);
    }
  }, []);

  // ── API Loader: Enriched Profile (GET /api/profile) ──
  const loadProfile = useCallback(async () => {
    if (!getToken()) return;
    try {
      const data = await apiFetchProfile();
      if (data) {
        setProfile(prev => ({
          ...prev,
          id: data.id || data.userId || prev.id,
          name: data.name || prev.name,
          email: data.email || prev.email,
          avatar: data.avatar || prev.avatar,
          currentRole: data.currentRole || prev.currentRole,
          targetRole: data.targetRole || prev.targetRole,
          educationLevel: data.educationLevel || prev.educationLevel,
          experienceLevel: data.experienceLevel || prev.experienceLevel,
          interests: data.interests && data.interests.length > 0 ? data.interests : prev.interests,
          learningPreferences: {
            ...prev.learningPreferences,
            format: data.learningPreferences || prev.learningPreferences?.format,
            weeklyHours: data.weeklyHours || Math.round(((data.minutesPerDay || 60) * (data.daysPerWeek || 5)) / 60) || prev.learningPreferences?.weeklyHours,
          },
        }));
      }
    } catch (err) {
      console.warn('[HADES] Profile fetch warning:', err);
    }
  }, []);

  // ── API Loader: Active Learning Path (GET /api/learning-paths) ──
  const loadActiveLearningPath = useCallback(async () => {
    if (!getToken()) return;
    try {
      const data = await apiFetchActiveLearningPath();
      if (data && data.nodes && data.nodes.length > 0) {
        const newRoadmap = mapBackendPathToRoadmap(data, profile.targetRole);
        const newPath = mapBackendPathToPhases(data, goal?.id, profile.targetRole);
        if (newRoadmap) {
          setRoadmap(newRoadmap);
          saveCachedJson(ROADMAP_STORAGE_KEY, newRoadmap);
          setAllRoadmaps(prev => {
            const exists = prev.some(r => r.title === newRoadmap.title || r.id === newRoadmap.id);
            const updated = exists ? prev : [newRoadmap, ...prev];
            saveCachedJson(ALL_ROADMAPS_STORAGE_KEY, updated);
            return updated;
          });
        }
        if (newPath) {
          setPath(newPath);
          saveCachedJson(PATH_STORAGE_KEY, newPath);
        }
        setHasGeneratedRoadmap(true);
        try { localStorage.setItem('hades_has_generated_roadmap', 'true'); } catch {}
      }
    } catch (err) {
      if (err.status !== 404) {
        console.warn('[HADES] Active learning path fetch error:', err);
      }
    }
  }, [profile.targetRole, goal?.id, mapBackendPathToRoadmap, mapBackendPathToPhases]);

  // ── API Loader: All Learning Paths History (GET /api/learning-paths/history) ──
  const loadLearningPathsHistory = useCallback(async () => {
    if (!getToken()) return;
    try {
      const historyList = await apiFetchLearningPathsHistory();
      if (Array.isArray(historyList) && historyList.length > 0) {
        const mappedList = historyList.map(item => mapBackendPathToRoadmap(item)).filter(Boolean);
        if (mappedList.length > 0) {
          setAllRoadmaps(prev => {
            const combined = [...mappedList];
            prev.forEach(p => {
              if (!combined.some(c => c.title === p.title)) combined.push(p);
            });
            saveCachedJson(ALL_ROADMAPS_STORAGE_KEY, combined);
            return combined;
          });
        }
      }
    } catch (err) {
      console.warn('[HADES] Roadmap history fetch error:', err);
    }
  }, [mapBackendPathToRoadmap]);

  // ── Switch Active Roadmap Track ──
  const switchRoadmapTrack = useCallback((selectedRoadmap) => {
    if (!selectedRoadmap) return;
    setRoadmap(selectedRoadmap);
    saveCachedJson(ROADMAP_STORAGE_KEY, selectedRoadmap);

    const mappedPhases = mapBackendPathToPhases(
      { title: selectedRoadmap.title, description: selectedRoadmap.description, nodes: selectedRoadmap.mainNodes || [] },
      goal?.id,
      selectedRoadmap.rootTopic
    );
    if (mappedPhases) {
      setPath(mappedPhases);
      saveCachedJson(PATH_STORAGE_KEY, mappedPhases);
    }

    if (selectedRoadmap.rootTopic) {
      setProfile(prev => ({ ...prev, targetRole: selectedRoadmap.rootTopic }));
      setGoal(prev => ({ ...prev, targetRole: selectedRoadmap.rootTopic, title: selectedRoadmap.title }));
    }

    // Synchronize Resource Catalog tab with the selected domain's resources
    if (selectedRoadmap.mainNodes && selectedRoadmap.mainNodes.length > 0) {
      const extractedResources = selectedRoadmap.mainNodes.flatMap((mNode, mIdx) => {
        const list = [];
        if (Array.isArray(mNode.rankedVideos)) {
          mNode.rankedVideos.forEach((v, vIdx) => {
            list.push({
              id: `res-video-${mIdx}-${vIdx}`,
              title: v.title || `${mNode.title} Video Lecture`,
              format: 'video',
              durationMinutes: 20,
              source: v.channel || 'YouTube',
              url: v.url,
              rating: v.rating || 4.8,
              skillsCovered: [mNode.title],
              isSaved: false,
              progress: 0,
            });
          });
        }
        if (Array.isArray(mNode.articles)) {
          mNode.articles.forEach((a, aIdx) => {
            list.push({
              id: `res-art-${mIdx}-${aIdx}`,
              title: a.title || `${mNode.title} Documentation`,
              format: 'article',
              durationMinutes: 15,
              source: a.source || 'Documentation',
              url: a.url,
              rating: 4.9,
              skillsCovered: [mNode.title],
              isSaved: false,
              progress: 0,
            });
          });
        }
        return list;
      });
      if (extractedResources.length > 0) {
        setResources(extractedResources);
      }
    }

    apiRecordProgressEvent("TRACK_SWITCHED", {
      title: `Switched active domain to ${selectedRoadmap.title}`,
      track: selectedRoadmap.title,
    }).catch(() => {});
  }, [goal?.id, mapBackendPathToPhases]);

  // ── API Loader: Dashboard Overview (GET /api/dashboard) ──
  const loadDashboard = useCallback(async () => {
    if (!getToken()) return;
    setDashboardLoading(true);
    setDashboardError(null);
    try {
      const data = await apiFetchDashboard();
      
      if (data.user) {
        setProfile(prev => ({
          ...prev,
          id: data.user.userId || prev.id,
          targetRole: data.user.targetRole || prev.targetRole,
          experienceLevel: data.user.experienceLevel || prev.experienceLevel,
          learningPreferences: {
            ...prev.learningPreferences,
            weeklyHours: Math.round(((data.user.minutesPerDay || 60) * (data.user.daysPerWeek || 5)) / 60),
          },
        }));
      }

      if (data.activeGoal) {
        setGoal(prev => ({
          ...prev,
          id: data.activeGoal.id || prev.id,
          title: data.activeGoal.title || prev.title,
          description: data.activeGoal.description || prev.description,
          status: data.activeGoal.isActive ? 'in_progress' : prev.status,
        }));
      }

      if (data.currentPath && data.currentPath.nodes && data.currentPath.nodes.length > 0) {
        const newRoadmap = mapBackendPathToRoadmap(data.currentPath, data.user?.targetRole || profile.targetRole);
        const newPath = mapBackendPathToPhases(data.currentPath, data.activeGoal?.id || goal?.id, data.user?.targetRole || profile.targetRole);
        if (newRoadmap) {
          setRoadmap(newRoadmap);
          saveCachedJson(ROADMAP_STORAGE_KEY, newRoadmap);
        }
        if (newPath) {
          setPath(newPath);
          saveCachedJson(PATH_STORAGE_KEY, newPath);
        }
        setHasGeneratedRoadmap(true);
        try { localStorage.setItem('hades_has_generated_roadmap', 'true'); } catch {}
      }

      if (data.overallProgressPercent != null) {
        setPath(prev => ({
          ...prev,
          overallProgress: Math.round(data.overallProgressPercent),
        }));
      }

    } catch (err) {
      console.error('[HADES] Dashboard fetch failed:', err);
      setDashboardError(err.body?.message || err.message || 'Failed to load dashboard telemetry.');
    } finally {
      setDashboardLoading(false);
    }
  }, [profile.targetRole, goal?.id, mapBackendPathToRoadmap, mapBackendPathToPhases]);

  // ── Master Loader: Load all available backend data when authenticated ──
  const loadAllData = useCallback(async () => {
    if (!getToken()) return;
    await Promise.allSettled([
      loadProfile(),
      loadDashboard(),
      loadActiveLearningPath(),
      loadLearningPathsHistory(),
      loadSkills(),
      loadMilestones(),
      loadProgressStats(),
      loadProgressEvents(),
      loadResources(),
    ]);
  }, [loadProfile, loadDashboard, loadActiveLearningPath, loadLearningPathsHistory, loadSkills, loadMilestones, loadProgressStats, loadProgressEvents, loadResources]);

  // Auto-load on mount if token exists
  useEffect(() => {
    if (getToken()) {
      loadAllData();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Merge auth user data into profile ──
  const mergeAuthUser = useCallback((authUser) => {
    if (!authUser) return;
    setProfile(prev => ({
      ...prev,
      id: authUser.id || prev.id,
      name: authUser.name || prev.name,
      email: authUser.email || prev.email,
      avatar: authUser.avatar || prev.avatar,
    }));
    if (authUser.hasGeneratedRoadmap) {
      setHasGeneratedRoadmap(true);
      try { localStorage.setItem('hades_has_generated_roadmap', 'true'); } catch {}
    }
  }, []);

  // ── Submit onboarding (POST /api/onboarding) ──
  const submitOnboarding = useCallback(async (formData) => {
    const minutesPerDay = Math.round((formData.weeklyHours || 14) / 5 * 60 / 60) || 60;
    const daysPerWeek = 5;

    const prefMap = {
      'Hands-on Projects': 'hands_on',
      'Interactive Labs': 'hands_on',
      'Curated Videos': 'video',
      'Technical Articles & Whitepapers': 'reading',
    };
    const learningPreferences = [...new Set(
      (formData.learningFormats || []).map(f => prefMap[f] || 'hands_on')
    )];

    const payload = {
      experienceLevel: (formData.experienceLevel || 'intermediate').toLowerCase(),
      minutesPerDay,
      daysPerWeek,
      targetRole: formData.targetRole,
      interests: formData.interests || [],
      learningPreferences,
      goalTitle: formData.customGoal || `Master ${formData.targetRole}`,
      goalDescription: formData.customGoal || `Build expertise in ${formData.targetRole}`,
    };

    const result = await apiSubmitOnboarding(payload);
    
    if (result) {
      setProfile(prev => ({
        ...prev,
        targetRole: result.targetRole || prev.targetRole,
        experienceLevel: result.experienceLevel || prev.experienceLevel,
      }));
    }

    return result;
  }, []);

  // ── Generate learning path via AI (POST /api/learning-paths) ──
  const generateRoadmapForRole = useCallback(async (roleQuery, formData = {}) => {
    if (!roleQuery || !roleQuery.trim()) return;
    const cleanRole = roleQuery.trim();
    
    setIsGeneratingPath(true);

    try {
      const payload = {
        learner: {
          experience_level: (formData.experienceLevel || profile.experienceLevel || 'intermediate').toLowerCase(),
          interests: formData.interests || profile.interests || ['Generative AI', 'Agentic Workflows'],
          career: { target_role: cleanRole },
          learning_preferences: formData.learningPreferences || ['hands_on', 'video'],
          availability: {
            minutes_per_day: formData.minutesPerDay || 60,
            days_per_week: formData.daysPerWeek || 5,
          },
          existing_skills: (formData.interests || []).map(i => ({ name: i, confidence: 0.7 })),
          completed_learning: [],
        },
        goal: {
          title: formData.goalTitle || `Master ${cleanRole}`,
          description: formData.goalDescription || `Build production expertise in ${cleanRole}`,
        },
      };

      const backendPath = await apiGenerateLearningPath(payload);

      setProfile(prev => ({ ...prev, targetRole: cleanRole }));
      setGoal(prev => ({
        ...prev,
        title: backendPath.title || `Master ${cleanRole}`,
        targetRole: cleanRole,
      }));

      // Transform backend nodes into interactive roadmap structure
      const newRoadmap = mapBackendPathToRoadmap(backendPath, cleanRole);
      if (newRoadmap) {
        setRoadmap(newRoadmap);
        saveCachedJson(ROADMAP_STORAGE_KEY, newRoadmap);
        setAllRoadmaps(prev => {
          const filtered = prev.filter(r => r.title !== newRoadmap.title && r.id !== newRoadmap.id);
          const updated = [newRoadmap, ...filtered];
          saveCachedJson(ALL_ROADMAPS_STORAGE_KEY, updated);
          return updated;
        });
      }

      // Transform backend nodes into phases & trackable nodes
      const newPath = mapBackendPathToPhases(backendPath, goal?.id, cleanRole);
      if (newPath) {
        setPath(newPath);
        saveCachedJson(PATH_STORAGE_KEY, newPath);
      }

      setHasGeneratedRoadmap(true);
      try {
        localStorage.setItem('hades_has_generated_roadmap', 'true');
      } catch (e) {
        console.warn("Storage error:", e);
      }

      // Refresh auxiliary stats & telemetry
      loadSkills();
      loadMilestones();
      loadProgressStats();

      recordProgressEvent("ROADMAP_GENERATED", {
        title: `Generated roadmap for ${cleanRole}`,
        role: cleanRole,
      });

      return backendPath;
    } catch (err) {
      console.error('[HADES] Path generation failed:', err);
      throw err;
    } finally {
      setIsGeneratingPath(false);
    }
  }, [profile.experienceLevel, profile.interests, goal?.id, mapBackendPathToRoadmap, mapBackendPathToPhases, loadSkills, loadMilestones, loadProgressStats]);

  // ── Record progress event (POST /api/progress/events) ──
  const recordProgressEvent = useCallback(async (eventType, payload) => {
    const newEvent = {
      id: `ev_${Date.now()}`,
      type: eventType,
      title: payload?.title || eventType,
      timestamp: "Just now",
      data: payload
    };
    setRecentEvents(prev => {
      const updated = [newEvent, ...prev.slice(0, 15)];
      saveCachedJson(EVENTS_STORAGE_KEY, updated);
      return updated;
    });

    if (getToken()) {
      try {
        await apiRecordProgressEvent({
          eventType,
          entityId: payload?.branchId || payload?.resourceId || payload?.role || eventType,
          payload: JSON.stringify(payload || {}),
        });
      } catch (err) {
        console.warn('[HADES] Progress event recording failed:', err);
      }
    }
  }, []);

  // ── Update Profile & Persist (PUT /api/profile + POST /api/goals) ──
  const updateProfile = useCallback(async (newProfile) => {
    setProfile(prev => ({ ...prev, ...newProfile }));

    if (getToken()) {
      try {
        const updatePayload = {
          experienceLevel: newProfile.experienceLevel?.toLowerCase(),
          targetRole: newProfile.targetRole,
          minutesPerDay: newProfile.learningPreferences?.weeklyHours ? Math.round((newProfile.learningPreferences.weeklyHours / 5) * 60) : undefined,
          daysPerWeek: 5,
          learningPreferences: Array.isArray(newProfile.learningPreferences?.format) ? newProfile.learningPreferences.format : undefined,
        };
        await apiUpdateProfile(updatePayload);

        if (newProfile.targetRole) {
          await apiCreateGoal({
            title: `Master ${newProfile.targetRole}`,
            description: `Personalized track for ${newProfile.targetRole}`,
            targetRole: newProfile.targetRole,
          });
        }
      } catch (err) {
        console.warn('[HADES] Profile PUT failed:', err);
      }
    }

    recordProgressEvent("PROFILE_UPDATED", { title: "Learner Profile Updated" });
  }, [recordProgressEvent]);

  // ── Update Goal & Persist (POST /api/goals) ──
  const updateGoal = useCallback(async (newGoal) => {
    setGoal(prev => ({ ...prev, ...newGoal }));

    if (getToken() && newGoal.title) {
      try {
        await apiCreateGoal({
          title: newGoal.title,
          description: newGoal.description || `Learning path for ${newGoal.targetRole || 'engineering'}`,
          targetRole: newGoal.targetRole,
        });
      } catch (err) {
        console.warn('[HADES] Goal creation failed:', err);
      }
    }

    recordProgressEvent("GOAL_UPDATED", { title: `Goal set: ${newGoal.title}` });
  }, [recordProgressEvent]);

  const dismissAdaptationBanner = () => {
    setPath(prev => ({
      ...prev,
      pathAdaptationBanner: { ...prev.pathAdaptationBanner, visible: false }
    }));
  };

  const completeNode = (phaseId, nodeId) => {
    setPath(prev => {
      const newPhases = (prev.phases || []).map(ph => {
        if (ph.id !== phaseId) return ph;
        const newNodes = (ph.nodes || []).map(node => {
          if (node.id === nodeId) {
            return { ...node, status: 'completed' };
          }
          return node;
        });
        const completedCount = newNodes.filter(n => n.status === 'completed').length;
        const phaseProgress = Math.round((completedCount / (newNodes.length || 1)) * 100);
        return { ...ph, nodes: newNodes, progress: phaseProgress };
      });
      const updated = { ...prev, phases: newPhases, overallProgress: Math.min(100, (prev.overallProgress || 0) + 15) };
      saveCachedJson(PATH_STORAGE_KEY, updated);
      return updated;
    });
    recordProgressEvent("NODE_COMPLETED", { title: `Completed step: ${nodeId}` });
  };

  const updateBranchStatus = (mainNodeId, branchId, newStatus) => {
    setRoadmap(prev => {
      const newMainNodes = (prev.mainNodes || []).map(mNode => {
        if (mNode.id !== mainNodeId && !mNode.branches?.some(b => b.id === branchId)) return mNode;
        const newBranches = (mNode.branches || []).map(br => {
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

      const updated = { ...prev, mainNodes: newMainNodes };
      saveCachedJson(ROADMAP_STORAGE_KEY, updated);
      return updated;
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
    recordProgressEvent("RESOURCE_SAVED", { title: item?.title || "Resource Saved", resourceId });
  };

  const updateResourceProgress = (resourceId, newProgress) => {
    setResources(prev =>
      prev.map(r => r.id === resourceId ? { ...r, progress: newProgress } : r)
    );
    if (newProgress === 100) {
      recordProgressEvent("RESOURCE_COMPLETED", { title: `Finished resource: ${resourceId}`, resourceId });
    }
  };

  // ── AI Assistant Chat (POST /api/assistant/chat) ──
  const sendAssistantMessage = useCallback(async (userText) => {
    if (!userText || !userText.trim()) return;
    
    const userMsg = {
      id: `msg_${Date.now()}`,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: userText
    };

    setAssistantMessages(prev => [...prev, userMsg]);
    recordProgressEvent("ASSISTANT_QUERY", { title: userText.slice(0, 30) });

    if (getToken()) {
      try {
        const data = await apiSendChatMessage(userText);
        if (data && data.reply) {
          const botMsg = {
            id: `msg_${Date.now() + 1}`,
            sender: "assistant",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            content: data.reply
          };
          setAssistantMessages(prev => [...prev, botMsg]);
          return;
        }
      } catch (err) {
        console.error('[HADES] AI Coach API error:', err);
        const errMsg = {
          id: `msg_${Date.now() + 1}`,
          sender: "assistant",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          content: `AI Coach request failed: ${err.message || 'Server error'}. Please verify backend connection.`
        };
        setAssistantMessages(prev => [...prev, errMsg]);
        return;
      }
    }

    const unauthMsg = {
      id: `msg_${Date.now() + 1}`,
      sender: "assistant",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: "Please log in to chat with your personalized HADES AI Coach."
    };
    setAssistantMessages(prev => [...prev, unauthMsg]);
  }, [recordProgressEvent]);

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
    : path?.overallProgress || progressStats?.overallProgressPercent || 0;

  return (
    <LearnerContext.Provider value={{
      profile,
      updateProfile,
      mergeAuthUser,
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
      progressStats,
      assistantMessages,
      sendAssistantMessage,
      isAssistantOpen,
      setIsAssistantOpen,
      allRoadmaps,
      activeRoadmapId: roadmap?.id,
      isRoadmapLibraryOpen,
      openRoadmapLibrary: () => setIsRoadmapLibraryOpen(true),
      closeRoadmapLibrary: () => setIsRoadmapLibraryOpen(false),
      switchRoadmapTrack,
      loadLearningPathsHistory,
      recentEvents,
      recordProgressEvent,
      isGeneratingPath,
      hasGeneratedRoadmap,
      setHasGeneratedRoadmap,
      generateRoadmapForRole,
      loadAllData,
      loadDashboard,
      loadProfile,
      loadResources,
      loadSkills,
      loadMilestones,
      loadProgressStats,
      loadProgressEvents,
      loadActiveLearningPath,
      submitOnboarding,
      dashboardLoading,
      dashboardError,
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
