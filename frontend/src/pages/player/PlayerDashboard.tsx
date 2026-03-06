import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { 
  Play, 
  TrendingUp, 
  Award, 
  History, 
  User, 
  LogOut, 
  Flame, 
  Star,
  Target,
  Calendar,
  User as UserIcon,
  Users,
  Trophy
} from 'lucide-react';
import { useAuth } from '@/context';

export default function PlayerDashboard() {
  const navigate = useNavigate();
  const { playerProfile, logout } = useAuth();

  if (!playerProfile) return null;

  const xpPercentage = (playerProfile.xp / playerProfile.xpToNextLevel) * 100;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const dashboardCards = [
    { title: 'Progress', icon: TrendingUp, gradient: 'from-blue-500 to-cyan-600', action: () => navigate('/player/progress') },
    { title: 'Badges', icon: Award, gradient: 'from-yellow-500 to-orange-600', action: () => navigate('/player/badges') },
    { title: 'History', icon: History, gradient: 'from-purple-500 to-pink-600', action: () => navigate('/player/history') },
    { title: 'Classement', icon: Trophy, gradient: 'from-amber-500 to-orange-600', action: () => navigate('/player/ranking') },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🎮</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">EduGame AI</h1>
              <p className="text-sm text-gray-600">Player Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/player/profile')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <User className="w-5 h-5 text-gray-700" />
              <span className="text-sm font-medium text-gray-700">Profile</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">Logout</span>
            </motion.button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Player Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 rounded-3xl p-8 text-white shadow-2xl mb-8"
        >
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring' }}
                className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-4xl border-4 border-white/30"
              >
                👦
              </motion.div>
              <div>
                <h2 className="text-3xl font-bold mb-1">{playerProfile.name}</h2>
                <p className="text-white/80 text-lg">{playerProfile.age} years old</p>
              </div>
            </div>
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="bg-yellow-400 text-yellow-900 px-4 py-2 rounded-xl font-bold flex items-center gap-2"
            >
              <Star className="w-5 h-5" />
              Level {playerProfile.level}
            </motion.div>
          </div>

          {/* XP Progress */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">Experience Points</span>
              <span className="font-bold">
                {playerProfile.xp} / {playerProfile.xpToNextLevel} XP
              </span>
            </div>
            <div className="relative h-4 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpPercentage}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
              />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-5 h-5" />
                <p className="text-sm text-white/80">Total Score</p>
              </div>
              <p className="text-2xl font-bold">{playerProfile.totalScore.toLocaleString()}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-5 h-5" />
                <p className="text-sm text-white/80">Badges</p>
              </div>
              <p className="text-2xl font-bold">{playerProfile.badgesEarned}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-1">
                <Flame className="w-5 h-5" />
                <p className="text-sm text-white/80">Streak</p>
              </div>
              <p className="text-2xl font-bold">{playerProfile.currentStreak} days</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-5 h-5" />
                <p className="text-sm text-white/80">Sessions</p>
              </div>
              <p className="text-2xl font-bold">{playerProfile.totalSessions}</p>
            </div>
          </div>
        </motion.div>

        {/* Jeu solo / Jeu équipe */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">Jouer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              whileHover={{ scale: 1.03, y: -6 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/player/new-game', { state: { mode: 'Individual' } })}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-green-400"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-4">
                <UserIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Jeu solo</h3>
              <p className="text-gray-600 mb-4">Joue seul et améliore ton score. Quiz, mémoire, logique, réflexes.</p>
              <span className="inline-flex items-center gap-2 text-green-600 font-semibold">
                <Play className="w-4 h-4" /> Lancer une partie
              </span>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.03, y: -6 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/player/new-game', { state: { mode: 'Collective' } })}
              className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-purple-400"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Jeu équipe</h3>
              <p className="text-gray-600 mb-4">Rejoins une salle d’attente et joue avec d’autres joueurs.</p>
              <span className="inline-flex items-center gap-2 text-purple-600 font-semibold">
                <Play className="w-4 h-4" /> Jouer en équipe
              </span>
            </motion.div>
          </div>
        </motion.div>

        {/* Daily Challenge Banner */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl p-6 text-white shadow-lg mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-1">🏆 Daily Challenge</h3>
              <p className="text-white/90">Complete "Math Master Quiz" today and earn +50 XP bonus!</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/player/new-game')}
              className="bg-white text-orange-600 px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-shadow"
            >
              Start Now
            </motion.button>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ scale: 1.05, y: -5 }}
              onClick={card.action}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer"
            >
              <div className={`w-14 h-14 bg-gradient-to-br ${card.gradient} rounded-xl flex items-center justify-center mb-4`}>
                <card.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">{card.title}</h3>
            </motion.div>
          ))}
        </div>

        {/* Motivational Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">💪</span>
            <h3 className="text-xl font-bold text-gray-900">Keep Going, {playerProfile.name.split(' ')[0]}!</h3>
          </div>
          <p className="text-gray-600">
            You're on a {playerProfile.currentStreak}-day streak! Play one more game today to keep it going.
            You're only {playerProfile.xpToNextLevel - playerProfile.xp} XP away from Level {playerProfile.level + 1}!
          </p>
        </motion.div>
      </div>
    </div>
  );
}
