// User API
import api from "../config/axiosConfig";
import { USER_ENDPOINTS } from "../config/endpoints";
import type { PlayerOnboardingRequest } from "../types/api.types";

const userApi = {
  getMe: () => api.get(USER_ENDPOINTS.ME),
  updateProfile: (data: Record<string, unknown>) => api.put(USER_ENDPOINTS.UPDATE_PROFILE, data),
  changePassword: (data: Record<string, unknown>) => api.put(USER_ENDPOINTS.CHANGE_PASSWORD, data),
  completeOnboarding: (data: PlayerOnboardingRequest) =>
    api.patch(USER_ENDPOINTS.ONBOARDING, data, {
      headers: { "Content-Type": "application/json" },
    }),
};

export default userApi;
