import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Lock, CheckCircle } from 'lucide-react';
import type { Badge } from '@/data/types';
import { format } from 'date-fns';

const badges: Badge[] = [];

export default function Badges() {
  const navigate = useNavigate();

  const earnedBadges = badges.filter((b) => b.earned);
  const lockedBadges = badges.filter((b) => !b.earned);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/player/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </motion.button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Badges Collection</h1>
              <p className="text-sm text-gray-600">
                {earnedBadges.length} of {badges.length} badges earned
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 rounded-2xl p-6 text-white shadow-lg mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold mb-1">Your Progress</h3>
              <p className="text-white/90">Keep collecting badges to unlock special rewards!</p>
            </div>
            <div className="text-right">
              <p className="text-5xl font-bold">{earnedBadges.length}</p>
              <p className="text-white/90">badges</p>
            </div>
          </div>
          <div className="relative h-4 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${badges.length ? (earnedBadges.length / badges.length) * 100 : 0}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
            />
          </div>
        </motion.div>

        {/* Earned Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            Earned Badges
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {earnedBadges.map((badge, index) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border-2 border-green-300"
              >
                <div className="text-center mb-4">
                  <motion.div
                    initial={{ rotate: -10 }}
                    animate={{ rotate: 10 }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
                    className="text-6xl mb-3"
                  >
                    {badge.icon}
                  </motion.div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{badge.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{badge.description}</p>
                  {badge.earnedDate && (
                    <p className="text-xs text-green-600 font-semibold">
                      Earned on {format(new Date(badge.earnedDate), 'MMM dd, yyyy')}
                    </p>
                  )}
                </div>
                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <p className="text-xs text-green-700 font-medium">
                    ✓ {badge.unlockCondition}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Locked Badges */}
        {lockedBadges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Lock className="w-6 h-6 text-gray-600" />
              Locked Badges
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lockedBadges.map((badge, index) => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-200 opacity-75"
                >
                  <div className="text-center mb-4">
                    <div className="relative inline-block mb-3">
                      <div className="text-6xl grayscale opacity-50">{badge.icon}</div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Lock className="w-8 h-8 text-gray-400" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-700 mb-1">{badge.name}</h3>
                    <p className="text-sm text-gray-500 mb-2">{badge.description}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-gray-600 font-medium">
                      🔒 {badge.unlockCondition}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Motivation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-white rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">🎯</span>
            <h3 className="text-xl font-bold text-gray-900">Keep Going!</h3>
          </div>
          <p className="text-gray-600">
            Complete challenges and games to unlock more badges. Each badge represents a unique
            achievement in your learning journey!
          </p>
        </motion.div>
      </div>
    </div>
  );
}
