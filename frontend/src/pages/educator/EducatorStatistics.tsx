import { motion } from 'motion/react';
import { BarChart3, TrendingUp, Target } from 'lucide-react';
import EducatorSidebar from '@/components/educator/EducatorSidebar';
const questionPerformance: { question: string; correct: number; incorrect: number; difficulty: string }[] = [];
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function EducatorStatistics() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <EducatorSidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Question Statistics</h1>
            <p className="text-gray-600">Analyze student performance on your questions</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-green-500 to-teal-500 rounded-xl p-6 text-white"
            >
              <Target className="w-8 h-8 mb-4 opacity-80" />
              <h3 className="text-3xl font-bold mb-2">78%</h3>
              <p className="text-sm opacity-90">Average Success Rate</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-6 text-white"
            >
              <BarChart3 className="w-8 h-8 mb-4 opacity-80" />
              <h3 className="text-3xl font-bold mb-2">1,425</h3>
              <p className="text-sm opacity-90">Total Answers</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-6 text-white"
            >
              <TrendingUp className="w-8 h-8 mb-4 opacity-80" />
              <h3 className="text-3xl font-bold mb-2">+15%</h3>
              <p className="text-sm opacity-90">Improvement This Month</p>
            </motion.div>
          </div>

          {/* Question Performance Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <h2 className="text-lg font-bold text-gray-900 mb-6">Answer Distribution by Question</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={questionPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="question" stroke="#666" fontSize={11} angle={-15} textAnchor="end" height={100} />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip />
                <Bar dataKey="correct" fill="#10b981" radius={[8, 8, 0, 0]} name="Correct Answers" />
                <Bar dataKey="incorrect" fill="#ef4444" radius={[8, 8, 0, 0]} name="Incorrect Answers" />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Correct Answers</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Incorrect Answers</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
