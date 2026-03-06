import { motion } from 'motion/react';
import { HelpCircle, Gamepad2, Target, Users, TrendingUp, Clock } from 'lucide-react';
import EducatorSidebar from '@/components/educator/EducatorSidebar';
const educatorStats = { totalQuestionsCreated: 0, assignedGames: 0, avgSuccessRate: 0, studentActivity: 0 };
const questionPerformance: { question: string; correct: number; incorrect: number; difficulty: string }[] = [];
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function EducatorDashboard() {
  const stats = [
    {
      label: 'Questions Created',
      value: educatorStats.totalQuestionsCreated,
      icon: <HelpCircle className="w-6 h-6" />,
      color: 'from-green-500 to-teal-500',
      change: '+12 this month',
    },
    {
      label: 'Assigned Games',
      value: educatorStats.assignedGames,
      icon: <Gamepad2 className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-500',
      change: '5 active',
    },
    {
      label: 'Avg Success Rate',
      value: `${educatorStats.avgSuccessRate}%`,
      icon: <Target className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-500',
      change: '+3%',
    },
    {
      label: 'Student Activity',
      value: educatorStats.studentActivity,
      icon: <Users className="w-6 h-6" />,
      color: 'from-yellow-500 to-orange-500',
      change: 'This week',
    },
  ];

  const difficultyData = [
    { name: 'Easy', value: 35, color: '#10b981' },
    { name: 'Medium', value: 42, color: '#f59e0b' },
    { name: 'Hard', value: 23, color: '#ef4444' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <EducatorSidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Educator Dashboard</h1>
            <p className="text-gray-600">Create and manage educational content</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center text-white`}>
                    {stat.icon}
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                <p className="text-xs text-green-600 font-medium">{stat.change}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Question Performance */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Question Performance</h2>
                <Clock className="w-5 h-5 text-gray-400" />
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={questionPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="question" stroke="#666" fontSize={11} angle={-15} textAnchor="end" height={80} />
                  <YAxis stroke="#666" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="correct" fill="#10b981" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="incorrect" fill="#ef4444" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Difficulty Distribution */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <h2 className="text-lg font-bold text-gray-900 mb-6">Question Difficulty Distribution</h2>
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={difficultyData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {difficultyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-4">
                {difficultyData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm text-gray-600">{item.name}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-green-500 to-teal-500 rounded-xl p-8 text-white"
          >
            <h2 className="text-2xl font-bold mb-4">Ready to create?</h2>
            <p className="mb-6 opacity-90">Start adding questions to enhance the learning experience</p>
            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/educator/questions/add'}
                className="px-6 py-3 bg-white text-green-600 rounded-lg font-medium hover:shadow-lg transition-shadow"
              >
                Add New Question
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/educator/questions'}
                className="px-6 py-3 bg-white/20 text-white rounded-lg font-medium hover:bg-white/30 transition-colors border border-white/30"
              >
                View All Questions
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
