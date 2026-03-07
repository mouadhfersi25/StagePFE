// Admin API
import api from "../config/axiosConfig";
import { ADMIN_ENDPOINTS } from "../config/endpoints";
import type { CreateBadgeRequest, UpdateBadgeRequest } from "../types/api.types";

const adminApi = {
  getUsers: () => api.get(ADMIN_ENDPOINTS.USERS),
  getUserById: (id: number | string) =>
    api.get(ADMIN_ENDPOINTS.USER_BY_ID(id), { params: { _t: Date.now() } }),
  suspendUser: (id: number | string) => api.post(ADMIN_ENDPOINTS.SUSPEND_USER(id)),
  reactivateUser: (id: number | string) => api.post(ADMIN_ENDPOINTS.REACTIVATE_USER(id)),
  updateUserRole: (id: number | string, role: string) =>
    api.put(ADMIN_ENDPOINTS.USER_ROLE(id), { role: String(role) }),
  getGames: () => api.get(ADMIN_ENDPOINTS.GAMES),
  getGameById: (id: number | string) => api.get(ADMIN_ENDPOINTS.GAME_BY_ID(id)),
  createGame: (data: Record<string, unknown>) => api.post(ADMIN_ENDPOINTS.GAMES, data),
  updateGame: (id: number | string, data: Record<string, unknown>) =>
    api.put(ADMIN_ENDPOINTS.GAME_BY_ID(id), data),
  deleteGame: (id: number | string) => api.delete(ADMIN_ENDPOINTS.GAME_BY_ID(id)),
  getBadges: () => api.get(ADMIN_ENDPOINTS.BADGES),
  getBadgeById: (id: number | string) => api.get(ADMIN_ENDPOINTS.BADGE_BY_ID(id)),
  createBadge: (data: CreateBadgeRequest) => api.post(ADMIN_ENDPOINTS.BADGES, data),
  updateBadge: (id: number | string, data: UpdateBadgeRequest) =>
    api.put(ADMIN_ENDPOINTS.BADGE_BY_ID(id), data),
  deleteBadge: (id: number | string) => api.delete(ADMIN_ENDPOINTS.BADGE_BY_ID(id)),
};

export default adminApi;
