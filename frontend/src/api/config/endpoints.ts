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
} as const;

export const ADMIN_ENDPOINTS = {
  USERS: "/admin/users",
  USER_BY_ID: (id: number | string) => `/admin/users/${id}`,
  SUSPEND_USER: (id: number | string) => `/admin/users/suspend/${id}`,
  REACTIVATE_USER: (id: number | string) => `/admin/users/reactivate/${id}`,
  USER_ROLE: (id: number | string) => `/admin/users/${id}/change-role`,
  GAMES: "/admin/games",
  GAME_BY_ID: (id: number | string) => `/admin/games/${id}`,
  BADGES: "/admin/badges",
  BADGE_BY_ID: (id: number | string) => `/admin/badges/${id}`,
} as const;

export const EDUCATOR_ENDPOINTS = {
  GAMES: "/educator/games",
  GAME_BY_ID: (id: number | string) => `/educator/games/${id}`,
  QUESTIONS: "/educator/questions",
  QUESTION_BY_ID: (id: number | string) => `/educator/questions/${id}`,
  MEMORY_CARDS: "/educator/memory-cards",
  MEMORY_CARD_BY_ID: (id: number | string) => `/educator/memory-cards/${id}`,
  DASHBOARD_STATS: "/educator/dashboard/stats",
} as const;
