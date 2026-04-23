import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useLocation, useParams } from 'react-router';
import { ArrowLeft, Target, Zap } from 'lucide-react';
import userApi from '@/api/user/user.api';
import PlayerHeaderActions from '@/components/player/PlayerHeaderActions';
import { exitFullscreenSafely } from '@/utils/fullscreen';
import type { ReflexSettingsDTO } from '@/api/types';

interface Reaction {
  time: number;
  success: boolean;
}

interface ChoiceTarget {
  id: string;
  x: number;
  y: number;
  isCorrect: boolean;
}

export default function ReflexGame() {
  const navigate = useNavigate();
  const location = useLocation();
  const { gameId } = useParams();
  const { game, mode, roomCode, teamName } = location.state || {};

  const [gameState, setGameState] = useState<'ready' | 'waiting' | 'active' | 'toosoon' | 'missed'>('ready');
  const [round, setRound] = useState(0);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [targetPosition, setTargetPosition] = useState({ x: 50, y: 50 });
  const [startTime, setStartTime] = useState<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeRoundTokenRef = useRef(0);
  const resolvedRoundTokenRef = useRef<number | null>(null);
  const reactionDeadlinePerfRef = useRef<number | null>(null);
  const [settings, setSettings] = useState<ReflexSettingsDTO | null>(null);
  const [targetVariant, setTargetVariant] = useState<'icon' | 'color'>('icon');
  const [activeIsTrap, setActiveIsTrap] = useState(false);
  const [choiceTargets, setChoiceTargets] = useState<ChoiceTarget[]>([]);
  const [isFinishing, setIsFinishing] = useState(false);
  const sessionStartMsRef = useRef<number>(Date.now());

  const totalRounds = settings?.nombreRounds ?? 10;
  const maxReactionMs = settings?.tempsReactionMaxMs ?? 2000;
  const gameplayDifficulty = Math.max(0, Math.min(10, settings?.difficulte ?? 5));
  const reflexModel = (settings?.modeleReflexe ?? 'CLASSIC').toUpperCase();
  const isGameComplete = round >= totalRounds;

  useEffect(() => {
    if (!gameId) return;
    let cancelled = false;
    userApi.getReflexSettingsByGame(gameId)
      .then((res) => {
        if (!cancelled) setSettings(res.data ?? null);
      })
      .catch(() => {
        if (!cancelled) setSettings(null);
      });
    return () => { cancelled = true; };
  }, [gameId]);

  useEffect(() => {
    sessionStartMsRef.current = Date.now();
  }, [gameId]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (isGameComplete && reactions.length === totalRounds && !isFinishing) {
      setIsFinishing(true);
      const successfulReactions = reactions.filter((r) => r.success);
      const avgReactionTime = successfulReactions.length > 0
        ? Math.round(successfulReactions.reduce((sum, r) => sum + r.time, 0) / successfulReactions.length)
        : 0;
      const durationSeconds = Math.max(1, Math.round((Date.now() - sessionStartMsRef.current) / 1000));
      
      const score = Math.max(250 - avgReactionTime * 0.5, 50);
      const accuracy = Math.round((successfulReactions.length / totalRounds) * 100);

      setTimeout(async () => {
        await exitFullscreenSafely();
        navigate('/player/game-result', {
          state: {
            game,
            mode,
            roomCode,
            teamName,
            sessionData: {
              scoreFinal: Math.round(score),
              accuracy,
              reactionTime: avgReactionTime,
              durationSeconds,
              reussite: accuracy >= 70,
              totalRounds,
              successfulRounds: successfulReactions.length,
            },
          },
        });
      }, 2000);
    }
  }, [isGameComplete, reactions, totalRounds, isFinishing, game, mode, navigate]);

  const finalizeRound = (success: boolean, time: number, state: 'ready' | 'missed' | 'toosoon' = 'ready') => {
    setReactions((prev) => [...prev, { time, success }]);
    setRound((prev) => prev + 1);
    setGameState(state);
    setTimeout(() => {
      setRound((currentRound) => {
        if (currentRound < totalRounds) {
          setGameState('ready');
        }
        return currentRound;
      });
    }, state === 'ready' ? 500 : 1000);
  };

  const finalizeRoundSafe = (
    success: boolean,
    time: number,
    state: 'ready' | 'missed' | 'toosoon' = 'ready'
  ) => {
    const token = activeRoundTokenRef.current;
    if (resolvedRoundTokenRef.current === token) return;
    resolvedRoundTokenRef.current = token;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    reactionDeadlinePerfRef.current = null;
    finalizeRound(success, time, state);
  };

  const toPerfTimestamp = (eventTimeStamp?: number) => {
    if (typeof eventTimeStamp !== 'number' || Number.isNaN(eventTimeStamp)) return performance.now();
    // Some browsers expose epoch-based timestamps; convert to performance timeline.
    if (eventTimeStamp > 1_000_000_000_000) {
      return eventTimeStamp - performance.timeOrigin;
    }
    return eventTimeStamp;
  };

  const isWithinReactionWindow = (eventTimeStamp?: number) => {
    const deadline = reactionDeadlinePerfRef.current;
    if (deadline == null) return false;
    return toPerfTimestamp(eventTimeStamp) <= deadline;
  };

  const startRound = () => {
    if (isGameComplete || isFinishing) return;
    if (round === 0 && reactions.length === 0) {
      sessionStartMsRef.current = Date.now();
    }
    setGameState('waiting');

    const minDelay = Math.max(400, 1200 - gameplayDifficulty * 70);
    const maxDelay = Math.max(minDelay + 200, 3200 - gameplayDifficulty * 140);
    const delay = Math.random() * (maxDelay - minDelay) + minDelay;
    
    timeoutRef.current = setTimeout(() => {
      let isTrapRound = false;
      setTargetPosition({
        x: Math.random() * 70 + 15,
        y: Math.random() * 70 + 15,
      });
      if (settings?.typeStimuli === 'COLOR_FLASH') setTargetVariant('color');
      else if (settings?.typeStimuli === 'MIXED') setTargetVariant(Math.random() > 0.5 ? 'icon' : 'color');
      else setTargetVariant('icon');
      if (reflexModel === 'GO_NO_GO') {
        const ratio = Math.max(10, Math.min(90, settings?.noGoRatio ?? 30));
        isTrapRound = Math.random() * 100 < ratio;
        setActiveIsTrap(isTrapRound);
      } else {
        setActiveIsTrap(false);
      }
      if (reflexModel === 'CHOICE_REACTION') {
        const count = Math.max(2, Math.min(6, settings?.choiceTargetCount ?? 3));
        const correctIndex = Math.floor(Math.random() * count);
        const nextTargets: ChoiceTarget[] = Array.from({ length: count }).map((_, i) => ({
          id: `choice-${Date.now()}-${i}`,
          x: Math.random() * 70 + 15,
          y: Math.random() * 70 + 15,
          isCorrect: i === correctIndex,
        }));
        setChoiceTargets(nextTargets);
      } else {
        setChoiceTargets([]);
      }
      const roundToken = activeRoundTokenRef.current + 1;
      activeRoundTokenRef.current = roundToken;
      resolvedRoundTokenRef.current = null;
      reactionDeadlinePerfRef.current = performance.now() + maxReactionMs;
      setStartTime(Date.now());
      setGameState('active');
      
      // Auto-miss after configured reaction window
      timeoutRef.current = setTimeout(() => {
        if (activeRoundTokenRef.current !== roundToken) return;
        if (resolvedRoundTokenRef.current === roundToken) return;
        // In GO_NO_GO, not clicking a trap is a success.
        if (reflexModel === 'GO_NO_GO' && isTrapRound) {
          finalizeRoundSafe(true, maxReactionMs, 'ready');
          return;
        }
        finalizeRoundSafe(false, maxReactionMs, 'missed');
      }, maxReactionMs);
    }, delay);
  };

  const handleClick = () => {
    if (isGameComplete || isFinishing) return;
    if (gameState === 'ready') {
      startRound();
    } else if (gameState === 'waiting') {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      finalizeRound(false, 0, 'toosoon');
    } else if (gameState === 'active') {
      const reactionTime = Date.now() - startTime;
      if (!isWithinReactionWindow()) {
        finalizeRoundSafe(false, maxReactionMs, 'missed');
        return;
      }
      // In active state, clicking the game area (background) is never a success.
      // Success is only validated by clicking the proper target element.
      finalizeRoundSafe(false, reactionTime, 'missed');
    }
  };

  const handleTargetClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isGameComplete || isFinishing) return;
    if (gameState === 'active') {
      const reactionTime = Date.now() - startTime;
      if (!isWithinReactionWindow(e.timeStamp)) {
        finalizeRoundSafe(false, maxReactionMs, 'missed');
        return;
      }
      if (reflexModel === 'GO_NO_GO' && activeIsTrap) {
        finalizeRoundSafe(false, reactionTime, 'missed');
        return;
      }
      finalizeRoundSafe(true, reactionTime, 'ready');
    }
  };

  const handleChoiceTargetClick = (e: React.MouseEvent, target: ChoiceTarget) => {
    e.stopPropagation();
    if (isGameComplete || isFinishing) return;
    if (gameState !== 'active') return;
    if (!isWithinReactionWindow(e.timeStamp)) {
      finalizeRoundSafe(false, maxReactionMs, 'missed');
      return;
    }
    const reactionTime = Date.now() - startTime;
    finalizeRoundSafe(target.isCorrect, reactionTime, target.isCorrect ? 'ready' : 'missed');
  };

  const avgReactionTime = reactions.filter((r) => r.success).length > 0
    ? Math.round(reactions.filter((r) => r.success).reduce((sum, r) => sum + r.time, 0) / reactions.filter((r) => r.success).length)
    : 0;

  const getStateMessage = () => {
    switch (gameState) {
      case 'ready':
        return { text: 'Click to Start', color: 'text-blue-600', bg: 'bg-blue-50' };
      case 'waiting':
        return { text: 'Wait for the target...', color: 'text-yellow-600', bg: 'bg-yellow-50' };
      case 'active':
        if (reflexModel === 'GO_NO_GO' && activeIsTrap) {
          return { text: 'No-Go: do not click!', color: 'text-red-600', bg: 'bg-red-50' };
        }
        if (reflexModel === 'CHOICE_REACTION') {
          return { text: 'Click the correct target!', color: 'text-green-600', bg: 'bg-green-50' };
        }
        return { text: 'Click the target NOW!', color: 'text-green-600', bg: 'bg-green-50' };
      case 'toosoon':
        return { text: 'Too soon! Wait for the target', color: 'text-red-600', bg: 'bg-red-50' };
      case 'missed':
        return { text: 'Missed! Too slow', color: 'text-orange-600', bg: 'bg-orange-50' };
      default:
        return { text: '', color: '', bg: '' };
    }
  };

  const stateMessage = getStateMessage();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="bg-slate-950/75 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  if (window.confirm('Are you sure you want to quit?')) {
                    navigate('/player/dashboard');
                  }
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-white" />
              </motion.button>
              <div>
                <h1 className="text-xl font-bold text-white">{game?.title || 'Reflex Game'}</h1>
                <p className="text-sm text-slate-300">Test your reaction speed</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-white/10 rounded-lg border border-white/20">
                <span className="font-bold text-fuchsia-300">
                  Round: {round} / {totalRounds}
                </span>
              </div>
              {avgReactionTime > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg border border-white/20">
                  <Zap className="w-5 h-5 text-cyan-300" />
                  <span className="font-bold text-cyan-300">{avgReactionTime}ms</span>
                </div>
              )}
              <PlayerHeaderActions />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Game Area */}
        <motion.div
          onClick={handleClick}
          className={`relative h-[500px] rounded-2xl shadow-2xl cursor-pointer overflow-hidden border border-white/15 ${
            gameState === 'waiting'
              ? 'bg-yellow-100'
              : gameState === 'active'
              ? 'bg-green-100'
              : gameState === 'toosoon'
              ? 'bg-red-100'
              : gameState === 'missed'
              ? 'bg-orange-100'
              : 'bg-white'
          }`}
        >
          {/* Center Message */}
          {gameState !== 'active' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center"
            >
              <div className={`${stateMessage.bg} px-8 py-4 rounded-2xl mb-4`}>
                <p className={`text-2xl font-bold ${stateMessage.color}`}>
                  {stateMessage.text}
                </p>
              </div>
              {gameState === 'ready' && round < totalRounds && (
                <div className="text-slate-200 text-center">
                  <p className="mb-2">Click anywhere to start round {round + 1}</p>
                  <p className="text-sm">Wait for the target, then click it as fast as you can!</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Target */}
          <AnimatePresence>
            {gameState === 'active' && reflexModel !== 'CHOICE_REACTION' && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                onClick={handleTargetClick}
                style={{
                  position: 'absolute',
                  left: `${targetPosition.x}%`,
                  top: `${targetPosition.y}%`,
                }}
                className="transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className={`w-24 h-24 ${
                    targetVariant === 'color'
                      ? 'bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl'
                      : 'bg-gradient-to-br from-red-500 to-pink-500 rounded-full'
                  } flex items-center justify-center shadow-2xl border-4 border-white`}
                >
                  {targetVariant === 'color' ? (
                    <span className="text-white font-bold text-xl">GO</span>
                  ) : (
                    <Target className="w-12 h-12 text-white" />
                  )}
                </motion.div>
              </motion.div>
            )}
            {gameState === 'active' && reflexModel === 'CHOICE_REACTION' && choiceTargets.map((target) => (
              <motion.div
                key={target.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                onClick={(e) => handleChoiceTargetClick(e, target)}
                style={{ position: 'absolute', left: `${target.x}%`, top: `${target.y}%` }}
                className="transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
              >
                <motion.div
                  animate={{ scale: [1, 1.12, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl border-4 border-white ${
                    target.isCorrect
                      ? 'bg-gradient-to-br from-emerald-500 to-green-600'
                      : 'bg-gradient-to-br from-slate-400 to-slate-500'
                  }`}
                >
                  <Target className="w-8 h-8 text-white" />
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 bg-white/5 rounded-2xl p-6 border border-white/15 backdrop-blur-xl"
        >
          <h3 className="text-lg font-bold text-white mb-4">Your Results</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-500/15 rounded-xl border border-green-400/30">
              <p className="text-sm text-slate-300 mb-1">Successful</p>
              <p className="text-2xl font-bold text-green-600">
                {reactions.filter((r) => r.success).length}
              </p>
            </div>
            <div className="text-center p-4 bg-red-500/15 rounded-xl border border-red-400/30">
              <p className="text-sm text-slate-300 mb-1">Missed</p>
              <p className="text-2xl font-bold text-red-600">
                {reactions.filter((r) => !r.success).length}
              </p>
            </div>
            <div className="text-center p-4 bg-cyan-500/15 rounded-xl border border-cyan-400/30">
              <p className="text-sm text-slate-300 mb-1">Avg Time</p>
              <p className="text-2xl font-bold text-blue-600">
                {avgReactionTime || '—'}
                {avgReactionTime > 0 && <span className="text-sm">ms</span>}
              </p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <p className="text-sm text-slate-300 mb-1">Best Time</p>
              <p className="text-2xl font-bold text-purple-600">
                {reactions.filter((r) => r.success).length > 0
                  ? Math.min(...reactions.filter((r) => r.success).map((r) => r.time))
                  : '—'}
                {reactions.filter((r) => r.success).length > 0 && <span className="text-sm">ms</span>}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
