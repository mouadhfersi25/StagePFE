import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { ArrowLeft, CheckCircle, XCircle, Clock, Target, Users, User } from 'lucide-react';
import type { Session } from '@/data/types';
import { format } from 'date-fns';

const sessions: Session[] = [];

export default function History() {
  const navigate = useNavigate();

  const getGameTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'quiz':
        return '🧮';
      case 'memory':
        return '🧠';
      case 'logic':
        return '🎯';
      case 'reflex':
        return '⚡';
      default:
        return '🎮';
    }
  };

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
              <h1 className="text-2xl font-bold text-gray-900">Session History</h1>
              <p className="text-sm text-gray-600">View your past games</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-sm text-gray-600">Games Won</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {sessions.filter((s) => s.reussite).length}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-sm text-gray-600">Total Games</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">{sessions.length}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-sm text-gray-600">Avg Score</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {Math.round(
                sessions.length ? sessions.reduce((sum, s) => sum + s.scoreFinal, 0) / sessions.length : 0
              )}
            </p>
          </motion.div>
        </div>

        {/* Sessions Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Game
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Mode
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Result
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Accuracy
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sessions.map((session, index) => (
                  <motion.tr
                    key={session.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getGameTypeIcon(session.gameType)}</span>
                        <div>
                          <p className="font-semibold text-gray-900">{session.gameTitle}</p>
                          <p className="text-sm text-gray-600">{session.gameType}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">
                        {format(new Date(session.dateDebut), 'MMM dd, yyyy')}
                      </p>
                      <p className="text-xs text-gray-600">
                        {format(new Date(session.dateDebut), 'HH:mm')}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-gray-700">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">{session.duree}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-lg font-bold text-purple-600">{session.scoreFinal}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {session.mode === 'Individual' ? (
                          <User className="w-4 h-4 text-gray-600" />
                        ) : (
                          <Users className="w-4 h-4 text-gray-600" />
                        )}
                        <span className="text-sm text-gray-700">{session.mode}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {session.reussite ? (
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="text-sm font-semibold text-green-600">Win</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <XCircle className="w-5 h-5 text-red-600" />
                          <span className="text-sm font-semibold text-red-600">Lose</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {session.accuracy ? (
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{session.accuracy}%</p>
                          <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden mt-1">
                            <div
                              className={`h-full rounded-full ${
                                session.accuracy >= 80
                                  ? 'bg-green-500'
                                  : session.accuracy >= 60
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                              }`}
                              style={{ width: `${session.accuracy}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Empty State (if no sessions) */}
        {sessions.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl p-12 text-center shadow-lg"
          >
            <span className="text-6xl mb-4 block">📊</span>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No games played yet</h3>
            <p className="text-gray-600 mb-6">Start playing games to see your history here</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/player/new-game')}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold"
            >
              Play Your First Game
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
