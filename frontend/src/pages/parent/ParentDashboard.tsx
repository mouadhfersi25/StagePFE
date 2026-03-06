import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { 
  LogOut, 
  TrendingUp, 
  Award, 
  History, 
  BarChart3,
  User,
  Clock,
  Target,
  Flame,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/context';

const defaultChildProfile = {
  id: 'child-1',
  name: 'Mon enfant',
  age: 10,
  level: 1,
  xp: 0,
  xpToNextLevel: 100,
  totalScore: 0,
  badgesEarned: 0,
  currentStreak: 0,
  totalSessions: 0,
  weeklyPlayTime: '0 min',
  averageSuccessRate: 0,
  skills: { math: 0, logic: 0, memory: 0, reflex: 0 },
};

export default function ParentDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const childProfile = user?.role === 'parent' ? defaultChildProfile : null;

  if (!childProfile) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const dashboardCards = [
    {
      title: 'Child Progress',
      icon: TrendingUp,
      gradient: 'from-blue-500 to-cyan-600',
      action: () => navigate('/parent/child-progress'),
    },
    {
      title: 'Performance Analytics',
      icon: BarChart3,
      gradient: 'from-purple-500 to-pink-600',
      action: () => navigate('/parent/analytics'),
    },
    {
      title: 'Badges',
      icon: Award,
      gradient: 'from-yellow-500 to-orange-600',
      action: () => navigate('/parent/badges'),
    },
    {
      title: 'Session History',
      icon: History,
      gradient: 'from-green-500 to-emerald-600',
      action: () => navigate('/parent/history'),
    },
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
              <p className="text-sm text-gray-600">Parent Dashboard</p>
            </div>
          </div>
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
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Child Profile Card */}
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
                <h2 className="text-3xl font-bold mb-1">{childProfile.name}</h2>
                <p className="text-white/80 text-lg">{childProfile.age} years old</p>
              </div>
            </div>
            <div className="bg-yellow-400 text-yellow-900 px-4 py-2 rounded-xl font-bold flex items-center gap-2">
              <User className="w-5 h-5" />
              Level {childProfile.level}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-5 h-5" />
                <p className="text-sm text-white/80">Total Score</p>
              </div>
              <p className="text-2xl font-bold">{childProfile.totalScore.toLocaleString()}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-5 h-5" />
                <p className="text-sm text-white/80">Weekly Playtime</p>
              </div>
              <p className="text-2xl font-bold">{childProfile.weeklyPlayTime}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-5 h-5" />
                <p className="text-sm text-white/80">Success Rate</p>
              </div>
              <p className="text-2xl font-bold">{childProfile.averageSuccessRate}%</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-1">
                <Flame className="w-5 h-5" />
                <p className="text-sm text-white/80">Current Streak</p>
              </div>
              <p className="text-2xl font-bold">{childProfile.currentStreak} days</p>
            </div>
          </div>
        </motion.div>

        {/* AI Recommendations */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl p-6 text-white shadow-lg mb-8"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">🤖 AI Recommendation</h3>
              <p className="text-white/90 mb-3">
                {childProfile.name.split(' ')[0]} shows strong performance in Memory games (88%) but could
                improve in Logic puzzles (75%). We recommend more Logic Warriors sessions at Medium
                difficulty.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/parent/analytics')}
                className="bg-white text-orange-600 px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-shadow"
              >
                View Details
              </motion.button>
            </div>
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
              <div
                className={`w-14 h-14 bg-gradient-to-br ${card.gradient} rounded-xl flex items-center justify-center mb-4`}
              >
                <card.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">{card.title}</h3>
            </motion.div>
          ))}
        </div>

        {/* Skills Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-lg"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-6">Skills Overview</h3>
          <div className="space-y-4">
            {Object.entries(childProfile.skills).map(([skill, value]) => (
              <div key={skill}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-700 capitalize">{skill}</span>
                  <span className="font-bold text-purple-600">{value}%</span>
                </div>
                <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${value}%` }}
                    transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
                    className={`absolute inset-y-0 left-0 rounded-full ${
                      value >= 80
                        ? 'bg-green-500'
                        : value >= 70
                        ? 'bg-blue-500'
                        : 'bg-yellow-500'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
