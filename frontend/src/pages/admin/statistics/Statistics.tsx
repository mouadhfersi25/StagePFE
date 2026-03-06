import { motion } from 'motion/react';
import { TrendingUp, Users, Gamepad2, Clock } from 'lucide-react';
const gameStats: { name: string; plays: number; avgScore: number; completion: number }[] = [];
const ageGroupStats: { age: string; avgScore: number; players: number }[] = [];
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

export default function Statistics() {
  return (
    <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Global Statistics</h1>
            <p className="text-gray-600">Comprehensive platform analytics and insights</p>
          </div>

          {/* Games Performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Game Performance Metrics</h2>
              <Gamepad2 className="w-5 h-5 text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={gameStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip />
                <Bar dataKey="plays" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                <Bar dataKey="avgScore" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                <Bar dataKey="completion" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Age Group Performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Performance by Age Group</h2>
              <Users className="w-5 h-5 text-gray-400" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={ageGroupStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="age" stroke="#666" fontSize={12} />
                <YAxis yAxisId="left" stroke="#666" fontSize={12} />
                <YAxis yAxisId="right" orientation="right" stroke="#666" fontSize={12} />
                <Tooltip />
                <Line yAxisId="left" type="monotone" dataKey="avgScore" stroke="#f97316" strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="players" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Avg Score</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Players</span>
              </div>
            </div>
          </motion.div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-6 text-white"
            >
              <TrendingUp className="w-8 h-8 mb-4 opacity-80" />
              <h3 className="text-3xl font-bold mb-2">87.5%</h3>
              <p className="text-sm opacity-90">Overall Completion Rate</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-6 text-white"
            >
              <Users className="w-8 h-8 mb-4 opacity-80" />
              <h3 className="text-3xl font-bold mb-2">1,247</h3>
              <p className="text-sm opacity-90">Active Players</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-green-500 to-teal-500 rounded-xl p-6 text-white"
            >
              <Clock className="w-8 h-8 mb-4 opacity-80" />
              <h3 className="text-3xl font-bold mb-2">3h 25m</h3>
              <p className="text-sm opacity-90">Avg Playtime/User</p>
            </motion.div>
          </div>
    </div>
  );
}
