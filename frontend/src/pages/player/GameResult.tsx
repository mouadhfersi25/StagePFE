import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate, useLocation } from 'react-router';
import { 
  Home, 
  RotateCcw, 
  Trophy, 
  Star, 
  TrendingUp, 
  Award,
  Target,
  Clock,
  Zap
} from 'lucide-react';
import { useAuth } from '@/context';

export default function GameResult() {
  const navigate = useNavigate();
  const location = useLocation();
  const { playerProfile, updatePlayerProfile } = useAuth();
  const { game, mode, sessionData } = location.state || {};

  const [showLevelUp, setShowLevelUp] = useState(false);
  const [newBadge, setNewBadge] = useState<string | null>(null);

  useEffect(() => {
    if (!game || !sessionData) {
      navigate('/player/dashboard');
      return;
    }

    // Calculate XP gained
    const xpGained = Math.round(sessionData.scoreFinal * 0.5);
    
    if (playerProfile) {
      const newXp = playerProfile.xp + xpGained;
      const newTotalScore = playerProfile.totalScore + sessionData.scoreFinal;
      
      // Check for level up
      if (newXp >= playerProfile.xpToNextLevel) {
        setShowLevelUp(true);
        updatePlayerProfile({
          level: playerProfile.level + 1,
          xp: newXp - playerProfile.xpToNextLevel,
          totalScore: newTotalScore,
        });
      } else {
        updatePlayerProfile({
          xp: newXp,
          totalScore: newTotalScore,
        });
      }

      // Check for new badges
      if (sessionData.accuracy >= 90) {
        setNewBadge('Accuracy Expert');
      } else if (sessionData.reactionTime && sessionData.reactionTime < 300) {
        setNewBadge('Speed Genius');
      } else if (sessionData.scoreFinal >= 140 && game.type === 'quiz') {
        setNewBadge('Quiz Expert');
      }
    }
  }, []);

  if (!game || !sessionData) return null;

  const xpGained = Math.round(sessionData.scoreFinal * 0.5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center p-4">
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
        className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full"
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
            className="text-4xl font-bold text-gray-900 mb-2"
          >
            {sessionData.reussite ? '🎉 Great Job!' : '💪 Good Effort!'}
          </motion.h1>
          <p className="text-gray-600">{game.title}</p>
          {mode === 'Collective' && (
            <span className="inline-block mt-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
              Team Mode
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
            <p className="text-4xl font-bold">{sessionData.scoreFinal}</p>
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

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gray-50 rounded-2xl p-6 mb-8"
        >
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Performance Details
          </h3>
          <div className="space-y-3">
            {sessionData.accuracy !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Accuracy</span>
                <span className="font-bold text-gray-900">{sessionData.accuracy}%</span>
              </div>
            )}
            {sessionData.duration && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Duration
                </span>
                <span className="font-bold text-gray-900">{sessionData.duration}</span>
              </div>
            )}
            {sessionData.reactionTime && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Avg Reaction Time
                </span>
                <span className="font-bold text-gray-900">{sessionData.reactionTime}ms</span>
              </div>
            )}
            {sessionData.totalQuestions && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Questions</span>
                <span className="font-bold text-gray-900">
                  {sessionData.correctAnswers || 0} / {sessionData.totalQuestions}
                </span>
              </div>
            )}
            {sessionData.moves && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Moves</span>
                <span className="font-bold text-gray-900">{sessionData.moves}</span>
              </div>
            )}
            {sessionData.attempts && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Attempts</span>
                <span className="font-bold text-gray-900">{sessionData.attempts}</span>
              </div>
            )}
            {sessionData.hintsUsed !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Hints Used</span>
                <span className="font-bold text-gray-900">{sessionData.hintsUsed}</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Badge Earned */}
        {newBadge && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
            className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl p-6 mb-8 text-center"
          >
            <Award className="w-12 h-12 text-white mx-auto mb-2" />
            <h3 className="font-bold text-white text-xl mb-1">New Badge Unlocked!</h3>
            <p className="text-white text-lg">{newBadge}</p>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(`/player/game/${game.type}/${game.id}`, { state: { game, mode } })}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-blue-50 text-blue-600 rounded-xl font-semibold hover:bg-blue-100 transition-colors"
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

        {/* Motivational Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 text-center text-gray-600"
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
