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
} from '../types/api.types';

const educatorApi = {
  getGames: () => api.get<GameDTO[]>(EDUCATOR_ENDPOINTS.GAMES),
  getGameById: (id: number | string) => api.get<GameDTO>(EDUCATOR_ENDPOINTS.GAME_BY_ID(id)),
  getQuestions: (gameId: number) =>
    api.get<QuizQuestionDTO[]>(EDUCATOR_ENDPOINTS.QUESTIONS, { params: { gameId } }),
  getQuestionById: (id: number) =>
    api.get<QuizQuestionDTO>(EDUCATOR_ENDPOINTS.QUESTION_BY_ID(id)),
  createQuestion: (data: CreateQuizQuestionRequest) =>
    api.post<QuizQuestionDTO>(EDUCATOR_ENDPOINTS.QUESTIONS, data),
  updateQuestion: (id: number, data: UpdateQuizQuestionRequest) =>
    api.put<QuizQuestionDTO>(EDUCATOR_ENDPOINTS.QUESTION_BY_ID(id), data),
  deleteQuestion: (id: number) => api.delete(EDUCATOR_ENDPOINTS.QUESTION_BY_ID(id)),

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
