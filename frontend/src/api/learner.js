// ─────────────────────────────────────────────────────────────
// HADES Learner API — Complete Scala Backend Endpoints
// ─────────────────────────────────────────────────────────────
import { api } from './client';

/**
 * Fetch enriched learner profile.
 * GET /api/profile
 * @returns {Promise<{ id, userId, name, email, avatar, currentRole, targetRole, educationLevel, experienceLevel, minutesPerDay, daysPerWeek, interests, learningPreferences, weeklyHours }>}
 */
export function fetchProfile() {
  return api.get('/api/profile');
}

/**
 * Update learner profile.
 * PUT /api/profile
 * @param {{ experienceLevel?: string, minutesPerDay?: number, daysPerWeek?: number, targetRole?: string, learningPreferences?: string[] }} data
 * @returns {Promise<{ userId, experienceLevel, minutesPerDay, daysPerWeek, targetRole, learningPreferences }>}
 */
export function updateProfile(data) {
  return api.put('/api/profile', data);
}

/**
 * Submit onboarding preferences & initial goal.
 * POST /api/onboarding
 * @param {{ experienceLevel: string, minutesPerDay: number, daysPerWeek: number, targetRole: string, interests: string[], learningPreferences: string[], goalTitle: string, goalDescription: string }} data
 * @returns {Promise<{ userId, experienceLevel, minutesPerDay, daysPerWeek, targetRole, learningPreferences }>}
 */
export function submitOnboarding(data) {
  return api.post('/api/onboarding', data);
}

/**
 * Fetch dashboard overview & active telemetry.
 * GET /api/dashboard
 * @returns {Promise<{ user: any, activeGoal: any, currentPath: any, currentNodeId: string, overallProgressPercent: number, recentActivity: string[], nextRecommendedAction: string }>}
 */
export function fetchDashboard() {
  return api.get('/api/dashboard');
}

/**
 * Fetch active user learning path.
 * GET /api/learning-paths
 * @returns {Promise<{ title: string, description: string, estimated_hours: number, skills: any[], nodes: any[], milestones: any[] }>}
 */
export function fetchActiveLearningPath() {
  return api.get('/api/learning-paths');
}

/**
 * Fetch learning path by ID.
 * GET /api/learning-paths/:id
 * @param {string} id
 */
export function fetchLearningPathById(id) {
  return api.get(`/api/learning-paths/${id}`);
}

/**
 * Generate a personalized learning path via AI.
 * POST /api/learning-paths
 * @param {{ learner: { experience_level, interests, career: { target_role }, learning_preferences, availability: { minutes_per_day, days_per_week } }, goal: { title, description } }} data
 * @returns {Promise<{ title: string, description: string, estimated_hours: number, skills: any[], nodes: any[], milestones: any[] }>}
 */
export function generateLearningPath(data) {
  return api.post('/api/learning-paths', data);
}

/**
 * Fetch skill competencies matrix.
 * GET /api/skills
 * @returns {Promise<Array<{ id: string, name: string, category: string, mastery: number, target: number, confidence: string, trend: string }>>}
 */
export function fetchSkills() {
  return api.get('/api/skills');
}

/**
 * Fetch specific skill details.
 * GET /api/skills/:id
 * @param {string} id
 */
export function fetchSkill(id) {
  return api.get(`/api/skills/${id}`);
}

/**
 * Fetch individual skill progress.
 * GET /api/skills/:id/progress
 * @param {string} skillId
 */
export function fetchSkillProgress(skillId) {
  return api.get(`/api/skills/${skillId}/progress`);
}

/**
 * Fetch milestone badges and progress.
 * GET /api/milestones
 * @returns {Promise<Array<{ id: string, title: string, phase: string, status: string, completionDate: string, progress: number, skillsEarned: string[] }>>}
 */
export function fetchMilestones() {
  return api.get('/api/milestones');
}

/**
 * Fetch study streak & time stats.
 * GET /api/progress/stats
 * @returns {Promise<{ currentStreak: number, longestStreak: number, weeklyHoursLogged: number, weeklyHoursTarget: number, overallProgressPercent: number }>}
 */
export function fetchProgressStats() {
  return api.get('/api/progress/stats');
}

/**
 * Fetch activity telemetry event stream.
 * GET /api/progress/events
 * @returns {Promise<Array<{ id: string, eventType: string, entityId: string, payload: string, createdAt: string }>>}
 */
export function fetchProgressEvents() {
  return api.get('/api/progress/events');
}

/**
 * Record a progress event.
 * POST /api/progress/events
 * @param {{ eventType: string, entityId: string, payload: string }} data
 * @returns {Promise<{ id: string, event_type: string, status: string }>}
 */
export function recordProgressEvent(data) {
  return api.post('/api/progress/events', data);
}

/**
 * Fetch curated learning resources with optional filtering.
 * GET /api/resources?format=...&difficulty=...&saved=...
 * @param {{ format?: string, difficulty?: string, saved?: boolean }} params
 * @returns {Promise<Array<{ id: string, title: string, provider: string, type: string, format: string, duration: string, difficulty: string, rating: number, reviewsCount: number, matchScore: number, whyRecommended: string, skillsCovered: string[], progress: number, isSaved: boolean, thumbnail: string, url: string }>>}
 */
export function fetchResources(params = {}) {
  const queryParts = [];
  if (params.format && params.format !== 'all') queryParts.push(`format=${encodeURIComponent(params.format)}`);
  if (params.difficulty && params.difficulty !== 'all') queryParts.push(`difficulty=${encodeURIComponent(params.difficulty)}`);
  if (params.saved) queryParts.push(`saved=true`);
  const qs = queryParts.length ? `?${queryParts.join('&')}` : '';
  return api.get(`/api/resources${qs}`);
}

/**
 * Fetch specific resource by ID.
 * GET /api/resources/:id
 * @param {string} id
 */
export function fetchResourceById(id) {
  return api.get(`/api/resources/${id}`);
}

/**
 * Send a message to the AI assistant coach.
 * POST /api/assistant/chat
 * @param {string} message
 * @returns {Promise<{ reply: string }>}
 */
export function sendChatMessage(message) {
  return api.post('/api/assistant/chat', { message });
}

/**
 * Fetch active learning goal.
 * GET /api/goals
 * @returns {Promise<{ id: string, title: string, description: string, isActive: boolean }>}
 */
export function fetchGoal() {
  return api.get('/api/goals');
}

/**
 * Create or update active learning goal.
 * POST /api/goals
 * @param {{ title: string, description: string, targetRole?: string }} data
 * @returns {Promise<{ id: string, title: string, description: string, isActive: boolean }>}
 */
export function createGoal(data) {
  return api.post('/api/goals', data);
}

/**
 * Fetch RIASEC assessment result.
 * GET /api/riasec
 */
export function fetchRiasec() {
  return api.get('/api/riasec');
}

/**
 * Save RIASEC assessment profile.
 * POST /api/riasec
 * @param {{ realistic: number, investigative: number, artistic: number, social: number, enterprising: number, conventional: number }} data
 */
export function saveRiasec(data) {
  return api.post('/api/riasec', data);
}

/**
 * Fetch personalized AI recommendations.
 * GET /api/recommendations
 * @returns {Promise<Array<{ id: string, resource_id: string, score: number, explanation: string }>>}
 */
export function fetchRecommendations() {
  return api.get('/api/recommendations');
}

/**
 * Fetch assessment by ID.
 * GET /api/assessments/:id
 * @param {string} id
 */
export function fetchAssessment(id) {
  return api.get(`/api/assessments/${id}`);
}

/**
 * Submit assessment answers.
 * POST /api/assessments/:id/submit
 * @param {string} id
 * @param {{ answers: Record<string, number> }} data
 * @returns {Promise<{ score: number, passed: boolean, passingScore: number }>}
 */
export function submitAssessment(id, data) {
  return api.post(`/api/assessments/${id}/submit`, data);
}
