import apiClient from './apiClient';

/**
 * Quiz Results API
 */
export const getQuizResults = async (filters = {}) => {
  const { subtopic, role } = filters;
  const params = new URLSearchParams();
  if (subtopic) params.append('subtopic', subtopic);
  if (role) params.append('role', role);
  
  const queryString = params.toString();
  const endpoint = `/api/quiz-results${queryString ? `?${queryString}` : ''}`;
  const response = await apiClient.get(endpoint);
  return response.quizResults || [];
};

export const getQuizResultById = async (id) => {
  const response = await apiClient.get(`/api/quiz-results/${id}`);
  return response.quizResult;
};

export const submitQuizResult = async (quizData) => {
  const response = await apiClient.post('/api/quiz-results', quizData);
  return response.quizResult;
};

/** Faculty / Institute Admin: progress of every student in the caller's institute. */
export const getInstituteQuizResults = async () => {
  const response = await apiClient.get('/api/quiz-results/institute');
  return response;
};

export const getQuizStats = async () => {
  const response = await apiClient.get('/api/quiz-results/user/stats');
  return response.stats;
};

/**
 * LLM API
 */
export const generateQuizQuestions = async (topicName, projectTopic) => {
  const response = await apiClient.post('/api/llm/generate-quiz-questions', { topicName, projectTopic });
  return response.questions || [];
};

export const generateStudyPlan = async (role, country, numWords, temp = 1.0) => {
  const response = await apiClient.post('/api/llm/generate-study-plan', {
    role,
    country,
    numWords,
    temp
  });
  return response.data;
};

export const generateSubtopics = async (topicName, existingSubtopics = [], temp = 1.0) => {
  const response = await apiClient.post('/api/llm/generate-subtopics', {
    topicName,
    existingSubtopics,
    temp
  });
  return response.data;
};

export const generateReport = async (subtopic, keyConcepts, description = "", temp = 1.0) => {
  const response = await apiClient.post('/api/llm/generate-report', {
    subtopic,
    keyConcepts,
    description,
    temp
  });
  return response.data;
};

export const validateTopic = async (topic, levelOfLearning) => {
  const response = await apiClient.post('/api/llm/validate-topic', {
    topic,
    levelOfLearning
  });
  return response;
};

/**
 * Users API
 */
export const getUser = async (userId) => {
  const response = await apiClient.get(`/api/users/${userId}`);
  return response.user;
};

export const updateUser = async (userId, userData) => {
  const response = await apiClient.put(`/api/users/${userId}`, userData);
  return response;
};

export const resetUserPassword = async (userId, newPassword) => {
  const response = await apiClient.post(`/api/users/${userId}/reset-password`, { newPassword });
  return response;
};

/**
 * Projects API
 */
export const getProjects = async (type = 'all') => {
  const response = await apiClient.get(`/api/projects?type=${type}`);
  const projects = response.projects || [];
  // Normalize id to _id for frontend compatibility
  return projects.map(p => ({ _id: p.id || p._id, ...p }));
};

export const getProjectById = async (projectId) => {
  const response = await apiClient.get(`/api/projects/${projectId}`);
  const project = response.project || response;
  // Normalize id to _id for frontend compatibility
  return { _id: project.id || project._id, ...project };
};

export const getPrivateProjects = async () => {
  const projects = await getProjects('private');
  return projects;
};

export const createProject = async (projectData) => {
  // If projectData contains 'topic' and 'levelOfLearning', the backend will auto-generate the study plan.
  // Otherwise, it expects the full project structure.
  const response = await apiClient.post('/api/projects', {
    ...projectData,
    type: 'private'
  });
  const project = response.project || response;
  // Normalize id to _id for frontend compatibility
  return { _id: project.id || project._id, ...project };
};

export const updateProject = async (projectId, projectData) => {
  const response = await apiClient.put(`/api/projects/${projectId}`, projectData);
  const project = response.project || response;
  // Normalize id to _id for frontend compatibility
  return { _id: project.id || project._id, ...project };
};

export const deleteProject = async (projectId, hardDelete = false) => {
  const response = await apiClient.delete(`/api/projects/${projectId}?hardDelete=${hardDelete}`);
  return response;
};

export const restoreProject = async (projectId) => {
  const response = await apiClient.put(`/api/projects/${projectId}`, {
    isTrashed: false
  });
  return response.project;
};

/**
 * Study Plans API
 */
export const getStudyPlans = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.instituteCode) params.append('instituteCode', filters.instituteCode);
  if (filters.published !== undefined) params.append('published', filters.published);
  
  const queryString = params.toString();
  const endpoint = `/api/study-plans${queryString ? `?${queryString}` : ''}`;
  const response = await apiClient.get(endpoint);
  return response.studyPlans || [];
};

export const getStudyPlanById = async (studyPlanId) => {
  const response = await apiClient.get(`/api/study-plans/${studyPlanId}`);
  const studyPlan = response.studyPlan || response;
  // Normalize id to _id for frontend compatibility
  return { _id: studyPlan._id || studyPlan.id, ...studyPlan };
};

export const createStudyPlan = async (studyPlanData) => {
  const response = await apiClient.post('/api/study-plans', studyPlanData);
  return response.studyPlan;
};

export const updateStudyPlan = async (studyPlanId, studyPlanData) => {
  const response = await apiClient.put(`/api/study-plans/${studyPlanId}`, studyPlanData);
  return response.studyPlan;
};

export const deleteStudyPlan = async (studyPlanId, hardDelete = false) => {
  const response = await apiClient.delete(`/api/study-plans/${studyPlanId}?hardDelete=${hardDelete}`);
  return response;
};

export const restoreStudyPlan = async (studyPlanId) => {
  const response = await apiClient.put(`/api/study-plans/${studyPlanId}`, {
    isTrashed: false
  });
  return response.studyPlan;
};

export const togglePublishStudyPlan = async (studyPlanId, isPublished) => {
  const response = await apiClient.patch(`/api/study-plans/${studyPlanId}/publish`, {
    isPublished: !isPublished
  });
  return response.studyPlan;
};

export const getPublishedStudyPlans = async (instituteCode = null) => {
  // If instituteCode is provided, filter by it; otherwise get all published projects
  const endpoint = instituteCode 
    ? `/api/study-plans/published?instituteCode=${instituteCode}`
    : `/api/study-plans/published`;
  const response = await apiClient.get(endpoint);
  return response.studyPlans || [];
};

/**
 * Rewards API
 */
export const getRewards = async () => {
  const response = await apiClient.getPublic('/api/rewards');
  return response.rewards || [];
};

/**
 * Redemptions API
 */
export const getRedemptions = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  
  const queryString = params.toString();
  const endpoint = `/api/redemptions${queryString ? `?${queryString}` : ''}`;
  const response = await apiClient.get(endpoint);
  return response.redemptions || [];
};

export const createRedemption = async (redemptionData) => {
  const response = await apiClient.post('/api/redemptions', redemptionData);
  return response.redemption;
};

/**
 * Institute Details API
 */
export const getInstituteDetails = async (instituteId) => {
  const response = await apiClient.get(`/api/institute-details/${instituteId}`);
  return response.instituteDetails;
};

export const updateInstituteDetails = async (instituteId, instituteData) => {
  const response = await apiClient.put(`/api/institute-details/${instituteId}`, instituteData);
  return response.instituteDetails;
};

/**
 * Challenges API
 */
export const createChallenge = async (challengeData) => {
  const response = await apiClient.post('/api/challenges', challengeData);
  return response.challenge;
};

export const getChallenges = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  if (filters.type) params.append('type', filters.type);
  if (filters.role) params.append('role', filters.role);
  
  const queryString = params.toString();
  const endpoint = `/api/challenges${queryString ? `?${queryString}` : ''}`;
  const response = await apiClient.get(endpoint);
  return response.challenges || [];
};

export const getChallengeById = async (challengeId) => {
  const response = await apiClient.get(`/api/challenges/${challengeId}`);
  return response.challenge;
};

export const acceptChallenge = async (challengeId) => {
  const response = await apiClient.post(`/api/challenges/${challengeId}/accept`, {});
  return response.challenge;
};

export const declineChallenge = async (challengeId) => {
  const response = await apiClient.post(`/api/challenges/${challengeId}/decline`, {});
  return response;
};

export const submitChallengeResult = async (challengeId, resultData) => {
  const response = await apiClient.post(`/api/challenges/${challengeId}/submit`, resultData);
  return response.challenge;
};

export const cancelChallenge = async (challengeId) => {
  const response = await apiClient.patch(`/api/challenges/${challengeId}/cancel`);
  return response;
};

export const getAvailableOpponents = async () => {
  const response = await apiClient.get('/api/challenges/available/opponents');
  return response.opponents || [];
};

/**
 * Daily Questions API
 */
export const getCurrentDailyQuestion = async () => {
  const response = await apiClient.getPublic('/api/daily-questions/current');
  return response.question;
};

export const submitDailyQuestionAnswer = async (answer) => {
  const response = await apiClient.postPublic('/api/daily-questions/submit', { answer });
  return response;
};

export const getDailyQuestionAttemptStatus = async () => {
  const response = await apiClient.get('/api/daily-questions/attempt-status');
  return response;
};

/**
 * Syllabus API
 */
export const uploadSyllabus = async (file) => {
  const { auth } = await import('../firebase/firebase-config');
  const Cookies = (await import('js-cookie')).default;
  const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';

  let token = Cookies.get('authToken');
  if (!token && auth.currentUser) {
    token = await auth.currentUser.getIdToken();
  }

  const formData = new FormData();
  formData.append('syllabus', file);

  const response = await fetch(`${API_BASE_URL}/api/syllabus/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Upload failed');
  return data.syllabus;
};

export const getSyllabus = async () => {
  const response = await apiClient.get('/api/syllabus');
  return response.syllabus;
};

export const deleteSyllabus = async () => {
  const response = await apiClient.delete('/api/syllabus');
  return response;
};

export const verifyPassword = async (password) => {
  const response = await apiClient.post('/api/auth/verify-password', { password });
  return response;
};

export const changeOwnPassword = async (currentPassword, newPassword) => {
  const response = await apiClient.post('/api/auth/change-password', { currentPassword, newPassword });
  return response;
};

/**
 * Events API
 */
export const getEvents = async () => {
  const response = await apiClient.getPublic('/api/events');
  return response.events || [];
};

export const getEventById = async (id) => {
  const response = await apiClient.get(`/api/events/${id}`);
  return response.event;
};

export const rsvpToEvent = async (id) => {
  const response = await apiClient.post(`/api/events/${id}/rsvp`, {});
  return response;
};

export const cancelEventRsvp = async (id) => {
  const response = await apiClient.post(`/api/events/${id}/cancel-rsvp`, {});
  return response;
};

/**
 * Puzzles API
 */
export const getRandomPuzzle = async () => {
  const response = await apiClient.get('/api/puzzles/random');
  return response.puzzle;
};

export const attemptPuzzle = async (puzzleId, answer) => {
  const response = await apiClient.post(`/api/puzzles/${puzzleId}/attempt`, { answer });
  return response;
};

