import Cookies from "js-cookie";
import apiClient from "../../utils/apiClient";
import {
  rsvpToEvent,
  cancelEventRsvp,
  createChallenge,
  acceptChallenge,
  declineChallenge,
  cancelChallenge,
  getChallengeById,
  submitQuizResult,
  changeOwnPassword,
  createProject,
  getSyllabus,
  uploadSyllabus,
  deleteSyllabus,
  getCurrentDailyQuestion,
  submitDailyQuestionAnswer,
} from "../../utils/apiServices";

/**
 * Client for the /api/v2 endpoints (truesight_backend, branch ui-revamp)
 * plus the v1 calls the revamped screens still use. Cache keys are scoped
 * to the signed-in user so a shared browser never shows someone else's
 * cached data.
 */

export const uidKey = (name) => `${Cookies.get("uid") || "anon"}:${name}`;

export const keys = {
  bootstrap: () => uidKey("bootstrap"),
  dashboard: () => uidKey("dashboard"),
  me: () => uidKey("me"),
  rewards: () => uidKey("shop:rewards"),
  reward: (id) => uidKey(`shop:reward:${id}`),
  wishlist: () => uidKey("shop:wishlist"),
  cart: () => uidKey("shop:cart"),
  orders: () => uidKey("shop:orders"),
  projects: () => uidKey("learn:projects"),
  project: (kind, id) => uidKey(`learn:project:${kind}:${id}`),
  results: () => uidKey("learn:results"),
  result: (id) => uidKey(`learn:result:${id}`),
  challenges: () => uidKey("learn:challenges"),
  challengeTopics: () => uidKey("learn:challenge-topics"),
  compare: (id) => uidKey(`learn:compare:${id}`),
  events: () => uidKey("events"),
  trash: () => uidKey("trash"),
  chats: (bookId) => uidKey(`chats:${bookId || "all"}`),
  chat: (id) => uidKey(`chat:${id}`),
  syllabus: () => uidKey("syllabus"),
  notifications: () => uidKey("notifications"),
  projectJobs: () => uidKey("learn:project-jobs"),
};

const v2 = (path) => `/api/v2${path}`;

export const api = {
  bootstrap: () => apiClient.get(v2("/bootstrap")),
  dashboard: () => apiClient.get(v2("/dashboard")),

  // profile
  me: () => apiClient.get(v2("/me")).then((r) => r.profile),
  updateMe: (patch) => apiClient.put(v2("/me"), patch).then((r) => r.profile),
  setPhoto: (photo) => apiClient.put(v2("/me/photo"), { photo }),
  changePassword: (currentPassword, newPassword) => changeOwnPassword(currentPassword, newPassword),

  // shop
  rewards: () => apiClient.get(v2("/shop/rewards")),
  reward: (id) => apiClient.get(v2(`/shop/rewards/${id}`)),
  wishlist: () => apiClient.get(v2("/shop/wishlist")),
  wish: (id) => apiClient.put(v2(`/shop/wishlist/${id}`), {}),
  unwish: (id) => apiClient.delete(v2(`/shop/wishlist/${id}`)),
  cart: () => apiClient.get(v2("/shop/cart")),
  saveCart: (items) => apiClient.put(v2("/shop/cart"), { items }),
  addToCart: (item) => apiClient.post(v2("/shop/cart/items"), item),
  validateCoupon: (code, subtotal) => apiClient.post(v2("/shop/coupons/validate"), { code, subtotal }),
  orders: () => apiClient.get(v2("/shop/orders")).then((r) => r.orders),
  placeOrder: (payload) => apiClient.post(v2("/shop/orders"), payload),
  cancelOrder: (id) => apiClient.post(v2(`/shop/orders/${id}/cancel`), {}),

  // learning
  projects: () => apiClient.get(v2("/learn/projects")),
  project: (kind, id) => apiClient.get(v2(`/learn/projects/${kind}/${id}`)),
  trashProject: (id) => apiClient.post(v2(`/learn/projects/${id}/trash`), {}),
  createProject: (payload) => createProject(payload),
  // Background roadmap generation: returns at once, ends with a notification.
  // With bookId, the roadmap (and its quizzes) are built from that Ask a Textbook upload only.
  generateProject: ({ topic, levelOfLearning, source, bookId }) =>
    apiClient.post(v2("/learn/projects/generate"), { topic, levelOfLearning, source, bookId }).then((r) => r.job),
  projectJobs: () => apiClient.get(v2("/learn/projects/jobs")).then((r) => r.jobs),
  dismissJob: (id) => apiClient.delete(v2(`/learn/projects/jobs/${id}`)),
  results: () => apiClient.get(v2("/learn/results")),
  result: (id) => apiClient.get(v2(`/learn/results/${id}`)).then((r) => r.result),
  trashResult: (id) => apiClient.delete(v2(`/learn/results/${id}`)),
  // -> { quizId, questions }; questions carry no answer key - the server grades on submit.
  // projectId lets the server quiz a textbook roadmap from its book.
  generateQuiz: (topicName, projectTopic, projectId) =>
    apiClient.post("/api/llm/generate-quiz-questions", { topicName, projectTopic, projectId }),
  submitQuiz: (payload) => submitQuizResult(payload),

  // challenges
  challenges: () => apiClient.get(v2("/learn/challenges")),
  challengeTopics: () => apiClient.get(v2("/learn/challenge-topics")).then((r) => r.domains),
  peers: (q) => apiClient.get(v2(`/learn/peers?q=${encodeURIComponent(q || "")}`)).then((r) => r.peers),
  compare: (id) => apiClient.get(v2(`/learn/challenges/${id}/compare`)),
  createChallenge: ({ topic, domain, opponentId }) =>
    createChallenge({ topic, domain, opponentId, challengeType: "async", matchingType: "invite" }),
  acceptChallenge,
  declineChallenge,
  cancelChallenge,
  getChallenge: getChallengeById,
  // -> { challenge, answers } with answers graded by the server.
  submitChallenge: (id, payload) => apiClient.post(`/api/challenges/${id}/submit`, payload),

  // events
  events: () => apiClient.get(v2("/events")),
  rsvp: rsvpToEvent,
  cancelRsvp: cancelEventRsvp,

  // trash
  trash: () => apiClient.get(v2("/trash")),
  restore: (items) => apiClient.post(v2("/trash/restore"), { items }),
  purge: (items) => apiClient.post(v2("/trash/delete"), { items }),
  emptyTrash: () => apiClient.post(v2("/trash/empty"), {}),
  trashTextbook: (book) => apiClient.post(v2("/trash/textbooks"), book),
  trashedTextbookIds: () => apiClient.get(v2("/trash/textbooks")).then((r) => r.bookIds),

  // assistant chats
  chats: (bookId) => apiClient.get(v2(`/chats${bookId ? `?bookId=${encodeURIComponent(bookId)}` : ""}`)).then((r) => r.chats),
  chat: (id) => apiClient.get(v2(`/chats/${id}`)).then((r) => r.chat),
  createChat: (payload) => apiClient.post(v2("/chats"), payload).then((r) => r.chat),
  appendChat: (id, messages) => apiClient.post(v2(`/chats/${id}/messages`), { messages }),
  renameChat: (id, title) => apiClient.patch(v2(`/chats/${id}`), { title }),
  trashChat: (id) => apiClient.delete(v2(`/chats/${id}`)),

  // notifications
  notifications: (before) => apiClient.get(v2(`/notifications?limit=30${before ? `&before=${encodeURIComponent(before)}` : ""}`)),
  unreadCount: () => apiClient.get(v2("/notifications/unread-count")).then((r) => r.unread),
  markRead: (id, read = true) => apiClient.post(v2(`/notifications/${id}/read`), { read }),
  markAllRead: () => apiClient.post(v2("/notifications/read-all"), {}),
  deleteNotification: (id) => apiClient.delete(v2(`/notifications/${id}`)),

  // syllabus mind map + daily question (v1)
  syllabus: getSyllabus,
  uploadSyllabus,
  deleteSyllabus,
  dailyQuestion: getCurrentDailyQuestion,
  answerDailyQuestion: submitDailyQuestionAnswer,
};
