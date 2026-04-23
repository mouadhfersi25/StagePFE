// User API
import api from "../config/axiosConfig";
import { USER_ENDPOINTS } from "../config/endpoints";
import type {
  PlayerOnboardingRequest,
  ReflexSettingsDTO,
  GameDTO,
  QuizQuestionDTO,
  MemoryCardDTO,
  LogicPuzzleDTO,
  CreateGameSessionRequest,
  CreateGameSessionResponse,
  SoloLeaderboardEntryDTO,
  TeamLeaderboardEntryDTO,
  PlayerBadgesOverviewDTO,
  PlayerBadgeOverviewItemDTO,
  PlayerRewardsOverviewDTO,
  PlayerRewardOverviewItemDTO,
  PlayerHistorySessionDTO,
  PlayerProgressOverviewDTO,
  RealtimeRoomStateDTO,
  CreateRoomRequest,
  JoinRoomRequest,
} from "../types/api.types";

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
  createGameSession: (data: CreateGameSessionRequest) =>
    api.post<CreateGameSessionResponse>(USER_ENDPOINTS.GAME_SESSIONS, data),
  getSoloLeaderboard: () => api.get<SoloLeaderboardEntryDTO[]>(USER_ENDPOINTS.LEADERBOARD_SOLO),
  getTeamLeaderboard: () => api.get<TeamLeaderboardEntryDTO[]>(USER_ENDPOINTS.LEADERBOARD_TEAM),
  getProgressOverview: () => api.get<PlayerProgressOverviewDTO>(USER_ENDPOINTS.PROGRESS_OVERVIEW),
  getBadgesOverview: () => api.get<PlayerBadgesOverviewDTO>(USER_ENDPOINTS.BADGES_OVERVIEW),
  claimBadge: (badgeId: number | string) => api.post<PlayerBadgeOverviewItemDTO>(USER_ENDPOINTS.BADGE_CLAIM(badgeId), {}),
  getRewardsOverview: () => api.get<PlayerRewardsOverviewDTO>(USER_ENDPOINTS.REWARDS_OVERVIEW),
  claimReward: (rewardId: number | string) => api.post<PlayerRewardOverviewItemDTO>(USER_ENDPOINTS.REWARD_CLAIM(rewardId), {}),
  getHistorySessions: () => api.get<PlayerHistorySessionDTO[]>(USER_ENDPOINTS.HISTORY_SESSIONS),
  createRoom: (data: CreateRoomRequest) => api.post<RealtimeRoomStateDTO>(USER_ENDPOINTS.ROOMS_CREATE, data),
  joinRoom: (data: JoinRoomRequest) => api.post<RealtimeRoomStateDTO>(USER_ENDPOINTS.ROOMS_JOIN, data),
  getRoom: (roomCode: string) => api.get<RealtimeRoomStateDTO>(USER_ENDPOINTS.ROOM_BY_CODE(roomCode)),
  setRoomReady: (roomCode: string, ready: boolean) =>
    api.patch<RealtimeRoomStateDTO>(USER_ENDPOINTS.ROOM_READY(roomCode), { ready }),
  startRoom: (roomCode: string) =>
    api.post<RealtimeRoomStateDTO>(USER_ENDPOINTS.ROOM_START(roomCode), {}),
  updateRoomTeamName: (roomCode: string, teamName: string) =>
    api.patch<RealtimeRoomStateDTO>(USER_ENDPOINTS.ROOM_TEAM_NAME(roomCode), { teamName }),
  getQuizQuestionsByGame: (gameId: number | string) =>
    api.get<QuizQuestionDTO[]>(USER_ENDPOINTS.GAME_QUIZ_QUESTIONS(gameId)),
  getMemoryCardsByGame: (gameId: number | string) =>
    api.get<MemoryCardDTO[]>(USER_ENDPOINTS.GAME_MEMORY_CARDS(gameId)),
  getLogicPuzzlesByGame: (gameId: number | string) =>
    api.get<LogicPuzzleDTO[]>(USER_ENDPOINTS.GAME_LOGIC_PUZZLES(gameId)),
};

export default userApi;
