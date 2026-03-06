import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useLocation, useParams } from 'react-router';
import { ArrowLeft, Target, Zap } from 'lucide-react';

interface Reaction {
  time: number;
  success: boolean;
}

export default function ReflexGame() {
  const navigate = useNavigate();
  const location = useLocation();
  const { gameId } = useParams();
  const { game, mode } = location.state || {};

  const [gameState, setGameState] = useState<'ready' | 'waiting' | 'active' | 'toosoon' | 'missed'>('ready');
  const [round, setRound] = useState(0);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [targetPosition, setTargetPosition] = useState({ x: 50, y: 50 });
  const [startTime, setStartTime] = useState<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const totalRounds = 10;
  const isGameComplete = round >= totalRounds;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (isGameComplete && reactions.length === totalRounds) {
      const successfulReactions = reactions.filter((r) => r.success);
      const avgReactionTime = successfulReactions.length > 0
        ? Math.round(successfulReactions.reduce((sum, r) => sum + r.time, 0) / successfulReactions.length)
        : 0;
      
      const score = Math.max(250 - avgReactionTime * 0.5, 50);
      const accuracy = Math.round((successfulReactions.length / totalRounds) * 100);

      setTimeout(() => {
        navigate('/player/game-result', {
          state: {
            game,
            mode,
            sessionData: {
              scoreFinal: Math.round(score),
              accuracy,
              reactionTime: avgReactionTime,
              duration: `${Math.floor(reactions.length * 3 / 60)} min`,
              reussite: accuracy >= 70,
              totalRounds,
              successfulRounds: successfulReactions.length,
            },
          },
        });
      }, 2000);
    }
  }, [isGameComplete, reactions]);

  const startRound = () => {
    setGameState('waiting');
    
    const delay = Math.random() * 3000 + 1000; // 1-4 seconds
    
    timeoutRef.current = setTimeout(() => {
      setTargetPosition({
        x: Math.random() * 70 + 15,
        y: Math.random() * 70 + 15,
      });
      setStartTime(Date.now());
      setGameState('active');
      
      // Auto-miss after 2 seconds
      timeoutRef.current = setTimeout(() => {
        if (gameState === 'active') {
          setGameState('missed');
          setReactions([...reactions, { time: 2000, success: false }]);
          setRound(round + 1);
          setTimeout(() => {
            if (round + 1 < totalRounds) {
              setGameState('ready');
            }
          }, 1000);
        }
      }, 2000);
    }, delay);
  };

  const handleClick = () => {
    if (gameState === 'ready') {
      startRound();
    } else if (gameState === 'waiting') {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setGameState('toosoon');
      setReactions([...reactions, { time: 0, success: false }]);
      setRound(round + 1);
      setTimeout(() => {
        if (round + 1 < totalRounds) {
          setGameState('ready');
        }
      }, 1000);
    } else if (gameState === 'active') {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      const reactionTime = Date.now() - startTime;
      setReactions([...reactions, { time: reactionTime, success: true }]);
      setRound(round + 1);
      setGameState('ready');
    }
  };

  const handleTargetClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (gameState === 'active') {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      const reactionTime = Date.now() - startTime;
      setReactions([...reactions, { time: reactionTime, success: true }]);
      setRound(round + 1);
      setTimeout(() => {
        if (round + 1 < totalRounds) {
          setGameState('ready');
        }
      }, 500);
    }
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
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
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </motion.button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{game?.title || 'Reflex Game'}</h1>
                <p className="text-sm text-gray-600">Test your reaction speed</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-purple-50 rounded-lg">
                <span className="font-bold text-purple-600">
                  Round: {round} / {totalRounds}
                </span>
              </div>
              {avgReactionTime > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
                  <Zap className="w-5 h-5 text-blue-600" />
                  <span className="font-bold text-blue-600">{avgReactionTime}ms</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Game Area */}
        <motion.div
          onClick={handleClick}
          className={`relative h-[500px] rounded-2xl shadow-2xl cursor-pointer overflow-hidden ${
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
                <div className="text-gray-600 text-center">
                  <p className="mb-2">Click anywhere to start round {round + 1}</p>
                  <p className="text-sm">Wait for the target, then click it as fast as you can!</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Target */}
          <AnimatePresence>
            {gameState === 'active' && (
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
                  className="w-24 h-24 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl border-4 border-white"
                >
                  <Target className="w-12 h-12 text-white" />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 bg-white rounded-2xl p-6 shadow-lg"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4">Your Results</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Successful</p>
              <p className="text-2xl font-bold text-green-600">
                {reactions.filter((r) => r.success).length}
              </p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Missed</p>
              <p className="text-2xl font-bold text-red-600">
                {reactions.filter((r) => !r.success).length}
              </p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Avg Time</p>
              <p className="text-2xl font-bold text-blue-600">
                {avgReactionTime || '—'}
                {avgReactionTime > 0 && <span className="text-sm">ms</span>}
              </p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Best Time</p>
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
