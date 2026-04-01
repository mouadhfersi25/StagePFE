// User API
import api from "../config/axiosConfig";
import { USER_ENDPOINTS } from "../config/endpoints";
import type { PlayerOnboardingRequest, ReflexSettingsDTO, GameDTO, QuizQuestionDTO, MemoryCardDTO } from "../types/api.types";

const userApi = {
  getMe: () => api.get(USER_ENDPOINTS.ME),
  updateProfile: (data: Record<string, unknown>) => api.put(USER_ENDPOINTS.UPDATE_PROFILE, data),
  changePassword: (data: Record<string, unknown>) => api.put(USER_ENDPOINTS.CHANGE_PASSWORD, data),
  completeOnboarding: (data: PlayerOnboardingRequest) =>
    api.patch(USER_ENDPOINTS.ONBOARDING, data, {
      headers: { "Content-Type": "application/json" },
    }),
  getReflexSettingsByGame: (gameId: number | string) =>
    api.get<ReflexSettingsDTO>(USER_ENDPOINTS.GAME_REFLEX_SETTINGS(gameId)),
  getAvailableGames: () => api.get<GameDTO[]>(USER_ENDPOINTS.AVAILABLE_GAMES),
  getQuizQuestionsByGame: (gameId: number | string) =>
    api.get<QuizQuestionDTO[]>(USER_ENDPOINTS.GAME_QUIZ_QUESTIONS(gameId)),
  getMemoryCardsByGame: (gameId: number | string) =>
    api.get<MemoryCardDTO[]>(USER_ENDPOINTS.GAME_MEMORY_CARDS(gameId)),
};

export default userApi;
