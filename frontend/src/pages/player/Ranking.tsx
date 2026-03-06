import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Trophy, Medal, Award } from 'lucide-react';
import { useAuth } from '@/context';

const MOCK_LEADERBOARD = [
  { rank: 1, name: 'Léa Martin', score: 5280, level: 8 },
  { rank: 2, name: 'Thomas Bernard', score: 4950, level: 7 },
  { rank: 3, name: 'Yassine Ben Ali', score: 4250, level: 5 },
  { rank: 4, name: 'Emma Petit', score: 4100, level: 5 },
  { rank: 5, name: 'Hugo Dubois', score: 3880, level: 5 },
  { rank: 6, name: 'Chloé Moreau', score: 3520, level: 4 },
  { rank: 7, name: 'Lucas Simon', score: 3190, level: 4 },
  { rank: 8, name: 'Jade Laurent', score: 2850, level: 4 },
  { rank: 9, name: 'Noah Michel', score: 2410, level: 3 },
  { rank: 10, name: 'Inès Garcia', score: 1980, level: 3 },
];

export default function Ranking() {
  const navigate = useNavigate();
  const { playerProfile } = useAuth();
  const currentPlayerName = playerProfile?.name ?? '';

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <span className="text-2xl">🥇</span>;
    if (rank === 2) return <span className="text-2xl">🥈</span>;
    if (rank === 3) return <span className="text-2xl">🥉</span>;
    return <span className="text-lg font-bold text-gray-500 w-8 text-center">#{rank}</span>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/player/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </motion.button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
                <Trophy className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Classement</h1>
                <p className="text-sm text-gray-600">Top joueurs par score total</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 text-white">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <Medal className="w-5 h-5" />
              Top 10
            </h2>
            <p className="text-white/90 text-sm">Classement statique — joue pour grimper !</p>
          </div>

          <ul className="divide-y divide-gray-100">
            {MOCK_LEADERBOARD.map((player, index) => {
              const isCurrentUser = player.name === currentPlayerName;
              return (
                <motion.li
                  key={player.rank}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center gap-4 px-6 py-4 transition-colors ${
                    isCurrentUser ? 'bg-green-50 border-l-4 border-green-500' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="w-12 flex justify-center">{getRankIcon(player.rank)}</div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-gray-900 truncate ${isCurrentUser ? 'text-green-800' : ''}`}>
                      {player.name}
                      {isCurrentUser && (
                        <span className="ml-2 text-xs font-normal text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                          Toi
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-500">Niveau {player.level}</p>
                  </div>
                  <div className="flex items-center gap-2 text-right">
                    <Award className="w-5 h-5 text-amber-500" />
                    <span className="font-bold text-gray-900">{player.score.toLocaleString()}</span>
                    <span className="text-sm text-gray-500">pts</span>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 text-center text-sm text-gray-500"
        >
          Le classement est mis à jour selon les scores des parties. Continue à jouer pour monter !
        </motion.p>
      </div>
    </div>
  );
}
