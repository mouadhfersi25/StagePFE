import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { useNavigate, useLocation } from 'react-router';
import { 
  Home, 
  RotateCcw, 
  Trophy, 
  Star, 
  TrendingUp, 
  Target,
  Clock,
  Zap
} from 'lucide-react';
import { useAuth } from '@/context';
import PlayerHeaderActions from '@/components/player/PlayerHeaderActions';
import userApi from '@/api/user/user.api';
import { toast } from 'sonner';

export default function GameResult() {
  const navigate = useNavigate();
  const location = useLocation();
  const { playerProfile, updatePlayerProfile, refreshUser } = useAuth();
  const { game, mode, roomCode, teamName, sessionData } = location.state || {};

  const [showLevelUp, setShowLevelUp] = useState(false);
  const [officialScore, setOfficialScore] = useState<number>(() => Number(sessionData?.scoreFinal || 0));
  const [xpGained, setXpGained] = useState<number>(0);
  const [scoringVersion, setScoringVersion] = useState<string>('');
  const [displayDuration, setDisplayDuration] = useState<string>('—');
  const [teamResult, setTeamResult] = useState<{
    teamName: string;
    rank: number | null;
    totalScore: number;
    averageScore: number;
    playersCount: number;
  } | null>(null);
  const hasSavedSessionRef = useRef(false);

  const normalizeRoomCode = (raw: unknown) => String(raw ?? '').trim().toUpperCase();

  const findTeamEntry = (
    rows: Array<{
      teamName?: string;
      roomCode?: string;
      totalScore?: number;
      averageScore?: number;
      playersCount?: number;
    }>,
    targetRoomCode: string,
    targetTeamName: string
  ) => {
    if (!Array.isArray(rows) || rows.length === 0) return null;
    const byRoom = rows.find((row) => normalizeRoomCode(row.roomCode) === targetRoomCode);
    if (byRoom) return byRoom;
    const normalizedTeam = targetTeamName.trim().toLowerCase();
    if (!normalizedTeam) return null;
    return rows.find((row) => String(row.teamName || '').trim().toLowerCase() === normalizedTeam) || null;
  };

  const formatDurationFromSeconds = (secondsRaw?: number, compact = false) => {
    const total = Math.max(0, Number(secondsRaw || 0));
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    if (compact) return `${mins}:${secs.toString().padStart(2, '0')}`;
    if (mins <= 0) return `${secs} sec`;
    return `${mins} min ${secs} sec`;
  };

  const formatDurationFromDates = (startRaw?: string, endRaw?: string) => {
    if (!startRaw || !endRaw) return null;
    const start = new Date(startRaw);
    const end = new Date(endRaw);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
    const diffSeconds = Math.max(0, Math.round((end.getTime() - start.getTime()) / 1000));
    return formatDurationFromSeconds(diffSeconds);
  };

  useEffect(() => {
    if (!game || !sessionData) {
      navigate('/player/dashboard');
    }
  }, [game, sessionData, navigate]);

  useEffect(() => {
    if (!game || !sessionData || hasSavedSessionRef.current) return;
    const parsedGameId = Number(game.id ?? sessionData.gameId);
    if (!Number.isFinite(parsedGameId) || parsedGameId <= 0) {
      console.error('Game session save skipped: invalid game id', { game, sessionData });
      toast.error("Impossible d'enregistrer la session: gameId invalide");
      return;
    }

    const parsedDurationSeconds = (() => {
      if (typeof sessionData.durationSeconds === 'number') {
        return Math.max(0, sessionData.durationSeconds);
      }
      const raw = String(sessionData.duration || '').trim().toLowerCase();
      const mmssMatch = raw.match(/^(\d+):(\d{1,2})$/);
      if (mmssMatch) {
        const mins = Number(mmssMatch[1] || 0);
        const secs = Number(mmssMatch[2] || 0);
        return mins * 60 + secs;
      }
      const minMatch = raw.match(/(\d+)\s*min/);
      if (minMatch) return Number(minMatch[1] || 0) * 60;
      return 0;
    })();

    hasSavedSessionRef.current = true;

    const persistSession = async () => {
      const isCollective = mode === 'Collective';
      const roomCodeNormalized = normalizeRoomCode(roomCode);
      const teamNameRaw = String(teamName || '').trim();
      const res = await userApi.createGameSession({
        gameId: parsedGameId,
        modeJeu: isCollective ? 'COLLECTIF' : 'INDIVIDUEL',
        roomCode: isCollective ? String(roomCode || '').trim() : undefined,
        teamName: isCollective ? teamNameRaw : undefined,
        etatSession: 'TERMINE',
        durationSeconds: parsedDurationSeconds,
        accuracyPercent: sessionData.accuracy != null ? Number(sessionData.accuracy) : undefined,
        reactionTimeMs: sessionData.reactionTime != null ? Number(sessionData.reactionTime) : undefined,
        totalQuestions: sessionData.totalQuestions != null ? Number(sessionData.totalQuestions) : undefined,
        correctAnswers: sessionData.correctAnswers != null ? Number(sessionData.correctAnswers) : undefined,
        moves: sessionData.moves != null ? Number(sessionData.moves) : undefined,
        matches: sessionData.matches != null ? Number(sessionData.matches) : undefined,
        attempts: sessionData.attempts != null ? Number(sessionData.attempts) : undefined,
        hintsUsed: sessionData.hintsUsed != null ? Number(sessionData.hintsUsed) : undefined,
        totalRounds: sessionData.totalRounds != null ? Number(sessionData.totalRounds) : undefined,
        successfulRounds: sessionData.successfulRounds != null ? Number(sessionData.successfulRounds) : undefined,
        reussite: sessionData.reussite != null ? Boolean(sessionData.reussite) : undefined,
      });

      const progression = res.data;
      setOfficialScore(Number(progression?.scoreFinal ?? progression?.scoreGlobal ?? 0));
      setXpGained(Math.max(0, progression?.xpGained ?? 0));
      setScoringVersion(String(progression?.scoringRulesVersion || ''));
      const durationFromDates = formatDurationFromDates(progression?.dateDebut, progression?.dateFin);
      const durationFromSeconds = progression?.durationSeconds != null
        ? formatDurationFromSeconds(progression.durationSeconds)
        : null;
      if (durationFromDates) {
        const start = progression?.dateDebut ? new Date(progression.dateDebut) : null;
        const end = progression?.dateFin ? new Date(progression.dateFin) : null;
        if (start && end && !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
          const diffSeconds = Math.max(0, Math.round((end.getTime() - start.getTime()) / 1000));
          setDisplayDuration(formatDurationFromSeconds(diffSeconds));
        } else {
          setDisplayDuration(durationFromDates);
        }
      } else if (durationFromSeconds) {
        setDisplayDuration(durationFromSeconds);
      } else if (typeof sessionData.durationSeconds === 'number') {
        setDisplayDuration(formatDurationFromSeconds(sessionData.durationSeconds));
      } else {
        const raw = String(sessionData?.duration || '').trim().toLowerCase();
        const mmssMatch = raw.match(/^(\d+):(\d{1,2})$/);
        if (mmssMatch) {
          const mins = Number(mmssMatch[1] || 0);
          const secs = Number(mmssMatch[2] || 0);
          setDisplayDuration(formatDurationFromSeconds(mins * 60 + secs));
        } else {
          setDisplayDuration('—');
        }
      }
      if (playerProfile) {
        updatePlayerProfile({
          niveau: progression?.newLevel ?? playerProfile.niveau ?? playerProfile.level,
          pointsExperience: progression?.newXp ?? playerProfile.pointsExperience ?? playerProfile.xp,
          scoreTotal: progression?.totalScore ?? playerProfile.scoreTotal ?? playerProfile.totalScore,
          level: progression?.newLevel ?? playerProfile.level,
          xp: progression?.newXp ?? playerProfile.xp,
          xpToNextLevel: progression?.xpToNextLevel ?? playerProfile.xpToNextLevel,
          totalScore: progression?.totalScore ?? playerProfile.totalScore,
        });
      }
      if (progression?.levelUp) {
        setShowLevelUp(true);
      }

      if (isCollective && roomCodeNormalized) {
        try {
          const afterRows = (await userApi.getTeamLeaderboard()).data || [];
          const afterEntry = findTeamEntry(afterRows, roomCodeNormalized, teamNameRaw);
          if (afterEntry) {
            const idx = afterRows.findIndex((row) => row === afterEntry);
            const currentRank = idx >= 0 ? idx + 1 : null;
            setTeamResult({
              teamName: String(afterEntry.teamName || teamNameRaw || `Equipe ${roomCodeNormalized}`),
              rank: currentRank,
              totalScore: Number(afterEntry.totalScore || 0),
              averageScore: Number(afterEntry.averageScore || 0),
              playersCount: Number(afterEntry.playersCount || 0),
            });
          }
        } catch {}
      }

      await refreshUser();
    };

    persistSession().catch((err: any) => {
      hasSavedSessionRef.current = false;
      const backendMessage = err?.response?.data?.message;
      console.error('Game session save failed', {
        status: err?.response?.status,
        data: err?.response?.data,
      });
      toast.error(backendMessage || "Echec d'enregistrement de la session");
    });
  }, [game, sessionData, playerProfile, updatePlayerProfile, refreshUser]);

  useEffect(() => {
    if (displayDuration !== '—') return;
    if (typeof sessionData?.durationSeconds === 'number') {
      setDisplayDuration(formatDurationFromSeconds(sessionData.durationSeconds));
      return;
    }
    const raw = String(sessionData?.duration || '').trim().toLowerCase();
    const mmssMatch = raw.match(/^(\d+):(\d{1,2})$/);
    if (mmssMatch) {
      const mins = Number(mmssMatch[1] || 0);
      const secs = Number(mmssMatch[2] || 0);
      setDisplayDuration(formatDurationFromSeconds(mins * 60 + secs));
    }
  }, [sessionData, displayDuration]);

  if (!game || !sessionData) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="pointer-events-none absolute -top-20 -left-20 w-72 h-72 rounded-full bg-fuchsia-600/30 blur-3xl" />
      <div className="pointer-events-none absolute top-20 -right-20 w-72 h-72 rounded-full bg-cyan-500/30 blur-3xl" />
      <div className="fixed top-4 right-4 z-40">
        <PlayerHeaderActions />
      </div>
      {/* Level Up Animation */}
      {showLevelUp && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowLevelUp(false)}
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', duration: 0.8 }}
            className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl p-12 text-center shadow-2xl"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <Star className="w-24 h-24 text-white mx-auto mb-4" />
            </motion.div>
            <h2 className="text-5xl font-bold text-white mb-2">Level Up!</h2>
            <p className="text-2xl text-white">
              You're now Level {playerProfile?.level}
            </p>
          </motion.div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 rounded-3xl border border-white/15 backdrop-blur-xl p-8 max-w-2xl w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className={`w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center ${
              sessionData.reussite
                ? 'bg-gradient-to-br from-green-400 to-emerald-500'
                : 'bg-gradient-to-br from-orange-400 to-red-500'
            }`}
          >
            {sessionData.reussite ? (
              <Trophy className="w-12 h-12 text-white" />
            ) : (
              <Target className="w-12 h-12 text-white" />
            )}
          </motion.div>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold text-white mb-2"
          >
            {sessionData.reussite ? '🎉 Great Job!' : '💪 Good Effort!'}
          </motion.h1>
          <p className="text-slate-300">{game.title}</p>
          {mode === 'Collective' && (
            <span className="inline-block mt-2 px-3 py-1 bg-purple-500/30 text-purple-100 rounded-full text-sm font-medium border border-purple-300/30">
              Team Mode{teamName ? ` • ${teamName}` : ''}
            </span>
          )}
        </div>

        {/* Score Breakdown */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl p-6 text-white"
          >
            <Trophy className="w-8 h-8 mb-2" />
            <p className="text-sm opacity-90 mb-1">Final Score</p>
            <p className="text-4xl font-bold">{officialScore}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-6 text-white"
          >
            <Star className="w-8 h-8 mb-2" />
            <p className="text-sm opacity-90 mb-1">XP Gained</p>
            <p className="text-4xl font-bold">+{xpGained}</p>
          </motion.div>
        </div>
        {scoringVersion && (
          <div className="text-xs text-slate-400 mb-6 text-center">
            Scoring rules: {scoringVersion}
          </div>
        )}

        {mode === 'Collective' && teamResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="bg-indigo-500/10 rounded-2xl p-6 mb-8 border border-indigo-300/25"
          >
            <h3 className="font-bold text-white mb-4">Team Result</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl border border-white/15 bg-white/5 px-3 py-2">
                <p className="text-slate-300">Équipe</p>
                <p className="font-bold text-white">{teamResult.teamName}</p>
              </div>
              <div className="rounded-xl border border-white/15 bg-white/5 px-3 py-2">
                <p className="text-slate-300">Rang actuel</p>
                <p className="font-bold text-white">{teamResult.rank ? `#${teamResult.rank}` : '—'}</p>
              </div>
              <div className="rounded-xl border border-white/15 bg-white/5 px-3 py-2">
                <p className="text-slate-300">Score équipe</p>
                <p className="font-bold text-white">{teamResult.totalScore.toLocaleString()} pts</p>
              </div>
              <div className="rounded-xl border border-white/15 bg-white/5 px-3 py-2">
                <p className="text-slate-300">Moyenne équipe</p>
                <p className="font-bold text-white">{Math.round(teamResult.averageScore)} pts</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/5 rounded-2xl p-6 mb-8 border border-white/10"
        >
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Performance Details
          </h3>
          <div className="space-y-3">
            {sessionData.accuracy !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Accuracy</span>
                <span className="font-bold text-white">{sessionData.accuracy}%</span>
              </div>
            )}
            {displayDuration && displayDuration !== '—' && (
              <div className="flex items-center justify-between">
                <span className="text-slate-300 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Duration
                </span>
                <span className="font-bold text-white">{displayDuration}</span>
              </div>
            )}
            {sessionData.reactionTime && (
              <div className="flex items-center justify-between">
                <span className="text-slate-300 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Avg Reaction Time
                </span>
                <span className="font-bold text-white">{sessionData.reactionTime}ms</span>
              </div>
            )}
            {sessionData.totalQuestions && (
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Questions</span>
                <span className="font-bold text-white">
                  {sessionData.correctAnswers || 0} / {sessionData.totalQuestions}
                </span>
              </div>
            )}
            {sessionData.moves && (
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Moves</span>
                <span className="font-bold text-white">{sessionData.moves}</span>
              </div>
            )}
            {sessionData.attempts && (
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Attempts</span>
                <span className="font-bold text-white">{sessionData.attempts}</span>
              </div>
            )}
            {sessionData.hintsUsed !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Hints Used</span>
                <span className="font-bold text-white">{sessionData.hintsUsed}</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(`/player/game/${game.type}/${game.id}`, { state: { game, mode, roomCode, teamName } })}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white/10 text-slate-100 rounded-xl font-semibold hover:bg-white/20 transition-colors border border-white/20"
          >
            <RotateCcw className="w-5 h-5" />
            Play Again
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/player/dashboard')}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-shadow"
          >
            <Home className="w-5 h-5" />
            Dashboard
          </motion.button>
        </div>
        {mode === 'Collective' && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/player/ranking', { state: { initialTab: 'TEAM' } })}
            className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-500/20 text-indigo-100 rounded-xl font-semibold border border-indigo-300/30 hover:bg-indigo-500/30 transition-colors"
          >
            <Trophy className="w-5 h-5" />
            Voir classement équipe
          </motion.button>
        )}

        {/* Motivational Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 text-center text-slate-300"
        >
          <p>
            {sessionData.reussite
              ? "🌟 Excellent work! You're improving every day!"
              : "💪 Keep practicing! Every attempt makes you stronger!"}
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
