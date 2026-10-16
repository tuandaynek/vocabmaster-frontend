export const ENDPOINTS = {
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
    ME: "/auth/me",
    REFRESH: "/auth/refresh",
    LOGOUT: "/auth/logout",
  },
  PROFILE: {
    GET: "/profile",
  },
  VOCAB: {
    EXTRACT: "/vocab/extract",
    SAVE: "/vocab/save",
    REVIEW: "/vocab/review",
    USER_LIST: "/vocab/user-list",
    GLOBAL_LIST: "/vocab/global-list",
    DUE_CARDS: "/vocab/due-cards",
    LIST: "/vocab",
    ADD: "/vocab/add",
    AUDIO: (text: string) => `/vocab/audio?text=${encodeURIComponent(text)}`,
    DELETE: (id: string) => `/vocab/user-item/${id}`,
  },
  COLLOCATION: {
    GLOBAL_LIST: "/collocation/global-list",
    SAVE: "/collocation/save",
    ADMIN_IMPORT: "/collocation/admin/import",
    DOWNLOAD: "/collocation/download",
    USER_LIST: "/collocation/user-list",
    DUE_CARDS: "/collocation/due-cards",
    REVIEW: "/collocation/review",
    NEXT_REVIEW: "/collocation/next-review",
    GET_REVIEW: (collocationId: string) => `/collocation/review/${collocationId}`,
    GET_VARIATIONS: (collocationId: string) => `/collocation/review/${collocationId}/variations`,
    GET_PHASE1: (collocationId: string) => `/collocation/review/${collocationId}/phase1`,
    EVALUATE_PHASE2: "/collocation/review/evaluate-phase2",
    EVALUATE_PHASE3: "/collocation/review/evaluate-phase3",
    COMPLETE_REVIEW: (collocationId: string) => `/collocation/review/${collocationId}/complete`,
  },
  SPEAKING: {
    CHAT_STEP: "/speaking/chat-step",
    COLLOCATIONS: "/speaking/collocations",
    HINTS: "/speaking/hints",
    EVALUATE: "/speaking/evaluate",
    EVALUATE_AUDIO: "/speaking/evaluate-audio",
    TTS_SAMPLE: "/tts/sample",
    HISTORY: "/speaking/history",
  },
  WRITING: {
    TUTOR_CHAT: "/writing/tutor-chat",
    OUTLINE: "/writing/outline",
    EVALUATE: "/writing/evaluate",
    SAVE: "/writing/save",
  },
  WEBSITE: {
    SUBMIT_RATING: "/website/submit-rating",
    GET_MY_RATING: "/website/my-rating",
    STATS_PUBLIC: "/website/stats/public",
  },
  GRAMMAR: {
    GET_TOPICS: "/grammar/topics",
    GET_SUB_TOPICS: (topicId: string) =>
      `/grammar/topics/${encodeURIComponent(topicId)}/sub-topics`,
    GET_SUB_TOPIC_DETAIL: (subTopicId: string) =>
      `/grammar/sub-topics/${encodeURIComponent(subTopicId)}`,
    GET_STAGES: (subTopicId: string) =>
      `/grammar/sub-topics/${encodeURIComponent(subTopicId)}/stages`,
    GET_QUESTIONS: (stageId: string) =>
      `/grammar/stages/${encodeURIComponent(stageId)}/questions`,
    SUBMIT_SESSION: "/grammar/sessions/submit",
    GET_USER_PROGRESS: (userId: string) =>
      `/grammar/users/${encodeURIComponent(userId)}/progress`,
    ADMIN_IMPORT_FULL_SUB_TOPIC: "/admin/grammar/sub-topics/import-full",
  }
};