import { useState, useEffect, use } from 'react';
import { motion } from 'motion/react';
import { Users, Gamepad2, Play, Award, TrendingUp, Clock, Loader2 } from 'lucide-react';
import { useAuth } from '@/context';
import adminApi from '@/api/admin';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function AdminDashboard() {
  const { user } = useAuth();
  const [totalPlayers, setTotalPlayers] = useState<number>(0);
  const [totalGames, setTotalGames] = useState<number>(0);
  const [loadingStats, setLoadingStats] = useState(true);

  const email = user?.email ?? '';
  const displayName = user?.name ?? (email ? email.split('@')[0].replace(/\./g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Admin');

  useEffect(() => {
    let cancelled = false;
    setLoadingStats(true);
    adminApi
      .getUsers()
      .then((res: { data?: unknown[] }) => {
        if (!cancelled && Array.isArray(res.data)) setTotalPlayers(res.data.length);
      })
      .catch(() => {
        if (!cancelled) setTotalPlayers(0);
      })
      .finally(() => {
        if (!cancelled) setLoadingStats(false);
      });
    return () => { cancelled = true; };
  }, []);
  useEffect(() => {
    let cancelled = false;
    adminApi
      .getGames()
      .then((res: { data?: unknown[] }) => {
        if (!cancelled && Array.isArray(res.data)) setTotalGames(res.data.length);
      })
      .catch(() => {
        if (!cancelled) setTotalGames(0);
      });
    return () => { cancelled = true; };
  }, []);

  const stats = [
    {
      label: 'Total Users',
      value: totalPlayers,
      icon: <Users className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-500',
      change: '—',
      loading: loadingStats,
    },
    {
      label: 'Total Games',
      value: totalGames,
      icon: <Gamepad2 className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-500',
      change: '—',
      loading: loadingStats,
    },
    {
      label: 'Active Sessions',
      value: 0,
      icon: <Play className="w-6 h-6" />,
      color: 'from-green-500 to-teal-500',
      change: 'Live',
      loading: false,
    },
    {
      label: 'Badges définis',
      value: 0,
      icon: <Award className="w-6 h-6" />,
      color: 'from-yellow-500 to-orange-500',
      change: '—',
      loading: false,
    },
  ];

  const weeklyData = DAYS.map((day) => ({ day, sessions: 0 }));
  const activityLogs: { id: string; player: string; action: string; game: string; timestamp: string }[] = [];
  const gameStats: { name: string; plays: number }[] = [];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {displayName}. Here&apos;s what&apos;s happening with your platform today.</p>
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
                  {stat.change !== '—' && (
                    <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                      {stat.change}
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  {stat.loading ? <Loader2 className="w-8 h-8 text-gray-400 animate-spin" /> : stat.value.toLocaleString()}
                </h3>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Activity Chart */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Weekly Activity</h2>
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" stroke="#666" fontSize={12} />
                  <YAxis stroke="#666" fontSize={12} />
                  <Tooltip />
                  <Line type="monotone" dataKey="sessions" stroke="#8b5cf6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Game Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
            >
              <h2 className="text-lg font-bold text-gray-900 mb-6">Top Games by Plays</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={gameStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#666" fontSize={12} />
                  <YAxis stroke="#666" fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="plays" fill="#f97316" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
              <Clock className="w-5 h-5 text-gray-400" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Player</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Action</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Game</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {activityLogs.map((activity) => (
                    <tr key={activity.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900">{activity.player}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          activity.action === 'Completed' ? 'bg-green-100 text-green-700' :
                          activity.action === 'Started' ? 'bg-blue-100 text-blue-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {activity.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{activity.game}</td>
                      <td className="py-3 px-4 text-sm text-gray-500">{activity.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
    </div>
  );
}
