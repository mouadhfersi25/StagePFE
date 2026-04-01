// Endpoints
export const AUTH_ENDPOINTS = {
  REGISTER: "/auth/register",
  LOGIN: "/auth/login",
  VERIFY: "/auth/verify",
  FORGOT: "/auth/forgot-password",
  RESET: "/auth/reset-password",
  LOGOUT: "/auth/logout",
} as const;

export const USER_ENDPOINTS = {
  ME: "/users/me",
  UPDATE_PROFILE: "/users/update-profile",
  CHANGE_PASSWORD: "/users/change-password",
  ONBOARDING: "/users/me/onboarding",
  GAME_REFLEX_SETTINGS: (gameId: number | string) => `/users/games/${gameId}/reflex-settings`,
  AVAILABLE_GAMES: "/users/games/available",
  GAME_QUIZ_QUESTIONS: (gameId: number | string) => `/users/games/${gameId}/quiz-questions`,
  GAME_MEMORY_CARDS: (gameId: number | string) => `/users/games/${gameId}/memory-cards`,
} as const;

export const ADMIN_ENDPOINTS = {
  USERS: "/admin/users",
  USER_BY_ID: (id: number | string) => `/admin/users/${id}`,
  SUSPEND_USER: (id: number | string) => `/admin/users/suspend/${id}`,
  REACTIVATE_USER: (id: number | string) => `/admin/users/reactivate/${id}`,
  USER_ROLE: (id: number | string) => `/admin/users/${id}/change-role`,
  GAMES: "/admin/games",
  GAME_BY_ID: (id: number | string) => `/admin/games/${id}`,
  GAME_AI_REVIEW: (id: number | string) => `/admin/games/${id}/ai-review`,
  GAME_STATUS: (id: number | string) => `/admin/games/${id}/status`,
  GAME_QUESTIONS: (id: number | string) => `/admin/games/${id}/questions`,
  GAME_MEMORY_CARDS: (id: number | string) => `/admin/games/${id}/memory-cards`,
  BADGES: "/admin/badges",
  BADGE_BY_ID: (id: number | string) => `/admin/badges/${id}`,
} as const;

export const EDUCATOR_ENDPOINTS = {
  GAMES: "/educator/games",
  GAME_BY_ID: (id: number | string) => `/educator/games/${id}`,
  GAME_SUBMIT: (id: number | string) => `/educator/games/${id}/submit`,
  QUESTIONS: "/educator/questions",
  QUESTION_BY_ID: (id: number | string) => `/educator/questions/${id}`,
  QUESTIONS_AI_GENERATE_PREVIEW: "/educator/questions/ai/generate-preview",
  REFLEX_SETTINGS: "/educator/reflex-settings",
  REFLEX_SETTINGS_AI_GENERATE_PREVIEW: "/educator/reflex-settings/ai/generate-preview",
  MEMORY_CARDS: "/educator/memory-cards",
  MEMORY_CARD_BY_ID: (id: number | string) => `/educator/memory-cards/${id}`,
  DASHBOARD_STATS: "/educator/dashboard/stats",
} as const;
