import api from '../config/axiosConfig';
import { EDUCATOR_ENDPOINTS } from '../config/endpoints';
import type {
  GameDTO,
  QuizQuestionDTO,
  CreateQuizQuestionRequest,
  UpdateQuizQuestionRequest,
  MemoryCardDTO,
  CreateMemoryCardRequest,
  UpdateMemoryCardRequest,
  EducatorDashboardStatsDTO,
  GenerateQuizPreviewRequest,
  GenerateReflexSettingsPreviewRequest,
  ReflexSettingsDTO,
  CreateOrUpdateReflexSettingsRequest,
} from '../types/api.types';

const educatorApi = {
  getGames: () => api.get<GameDTO[]>(EDUCATOR_ENDPOINTS.GAMES),
  getGameById: (id: number | string) => api.get<GameDTO>(EDUCATOR_ENDPOINTS.GAME_BY_ID(id)),
  createGame: (data: Record<string, unknown>) => api.post<GameDTO>(EDUCATOR_ENDPOINTS.GAMES, data),
  updateGame: (id: number | string, data: Record<string, unknown>) =>
    api.put<GameDTO>(EDUCATOR_ENDPOINTS.GAME_BY_ID(id), data),
  submitGame: (id: number | string) =>
    api.patch<GameDTO>(EDUCATOR_ENDPOINTS.GAME_SUBMIT(id)),
  deleteGame: (id: number | string) => api.delete(EDUCATOR_ENDPOINTS.GAME_BY_ID(id)),
  getQuestions: (gameId: number) =>
    api.get<QuizQuestionDTO[]>(EDUCATOR_ENDPOINTS.QUESTIONS, { params: { gameId } }),
  getQuestionById: (id: number) =>
    api.get<QuizQuestionDTO>(EDUCATOR_ENDPOINTS.QUESTION_BY_ID(id)),
  createQuestion: (data: CreateQuizQuestionRequest) =>
    api.post<QuizQuestionDTO>(EDUCATOR_ENDPOINTS.QUESTIONS, data),
  updateQuestion: (id: number, data: UpdateQuizQuestionRequest) =>
    api.put<QuizQuestionDTO>(EDUCATOR_ENDPOINTS.QUESTION_BY_ID(id), data),
  deleteQuestion: (id: number) => api.delete(EDUCATOR_ENDPOINTS.QUESTION_BY_ID(id)),
  generateQuizPreview: (data: GenerateQuizPreviewRequest) =>
    api.post<QuizQuestionDTO[]>(EDUCATOR_ENDPOINTS.QUESTIONS_AI_GENERATE_PREVIEW, data),
  getReflexSettings: (gameId: number) =>
    api.get<ReflexSettingsDTO>(EDUCATOR_ENDPOINTS.REFLEX_SETTINGS, { params: { gameId } }),
  upsertReflexSettings: (data: CreateOrUpdateReflexSettingsRequest) =>
    api.put<ReflexSettingsDTO>(EDUCATOR_ENDPOINTS.REFLEX_SETTINGS, data),
  generateReflexSettingsPreview: (data: GenerateReflexSettingsPreviewRequest) =>
    api.post<ReflexSettingsDTO>(EDUCATOR_ENDPOINTS.REFLEX_SETTINGS_AI_GENERATE_PREVIEW, data),

  getMemoryCards: (gameId: number) =>
    api.get<MemoryCardDTO[]>(EDUCATOR_ENDPOINTS.MEMORY_CARDS, { params: { gameId } }),
  createMemoryCard: (data: CreateMemoryCardRequest) =>
    api.post<MemoryCardDTO>(EDUCATOR_ENDPOINTS.MEMORY_CARDS, data),
  updateMemoryCard: (id: number, data: UpdateMemoryCardRequest) =>
    api.put<MemoryCardDTO>(EDUCATOR_ENDPOINTS.MEMORY_CARD_BY_ID(id), data),
  deleteMemoryCard: (id: number) => api.delete(EDUCATOR_ENDPOINTS.MEMORY_CARD_BY_ID(id)),

  getDashboardStats: () => api.get<EducatorDashboardStatsDTO>(EDUCATOR_ENDPOINTS.DASHBOARD_STATS),
};

export default educatorApi;
