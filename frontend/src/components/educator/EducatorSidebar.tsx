import { Link, useLocation } from 'react-router';
import { motion } from 'motion/react';
import { LayoutDashboard, HelpCircle, Gamepad2, BarChart3, LogOut } from 'lucide-react';
import { useAuth } from '@/context';
import { useNavigate } from 'react-router';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  section: 'overview' | 'content' | 'insights';
}

const navItems: NavItem[] = [
  {
    name: 'Dashboard',
    path: '/educator/dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
    section: 'overview',
  },
  {
    name: 'Quiz Question Bank',
    path: '/educator/questions',
    icon: <HelpCircle className="w-5 h-5" />,
    section: 'content',
  },
  {
    name: 'Game Content ',
    path: '/educator/games',
    icon: <Gamepad2 className="w-5 h-5" />,
    section: 'content',
  },
  {
    name: 'Learning Statistics',
    path: '/educator/statistics',
    icon: <BarChart3 className="w-5 h-5" />,
    section: 'insights',
  },
];

export default function EducatorSidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const email = user?.email ?? '';
  const displayName =
    user?.name ||
    (email ? email.split('@')[0].replace(/\./g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Educator');

  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || (email ? email.charAt(0).toUpperCase() : 'E');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="sticky top-0 w-64 h-screen bg-gradient-to-b from-emerald-50 via-white to-teal-50/40 border-r border-gray-200 flex flex-col shrink-0">
      {/* Logo / Brand */}
      <div className="p-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
            <span className="text-2xl">📚</span>
          </div>
          <div>
            <h2 className="font-bold text-gray-900">Educator Panel</h2>
            <p className="text-xs text-gray-500">Create questions & manage games</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 min-h-0 px-3 overflow-y-auto py-2">
        {/* Overview */}
        <p className="px-3 mb-1 text-[11px] font-semibold tracking-wide text-emerald-700/80 uppercase">Overview</p>
        {navItems
          .filter((item) => item.section === 'overview')
          .map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link key={item.path} to={item.path}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg mb-2 transition-colors ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                      : 'text-gray-700 hover:bg-emerald-50'
                  }`}
                >
                  {item.icon}
                  <span className="font-medium text-sm">{item.name}</span>
                </motion.div>
              </Link>
            );
          })}

        {/* Content management */}
        <p className="px-3 mt-1 mb-1 text-[11px] font-semibold tracking-wide text-emerald-700/80 uppercase">
          Quiz & Game Content
        </p>
        {navItems
          .filter((item) => item.section === 'content')
          .map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link key={item.path} to={item.path}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg mb-1 transition-colors ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                      : 'text-gray-700 hover:bg-emerald-50'
                  }`}
                >
                  {item.icon}
                  <div className="flex-1 flex items-center justify-between gap-2">
                    <span className="font-medium text-sm">{item.name}</span>
                    {item.path === '/educator/questions' && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                        Quiz
                      </span>
                    )}
                  </div>
                </motion.div>
              </Link>
            );
          })}

      
        {/* Insights */}
        <p className="px-3 mt-1 mb-1 text-[11px] font-semibold tracking-wide text-emerald-700/80 uppercase">Insights</p>
        {navItems
          .filter((item) => item.section === 'insights')
          .map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link key={item.path} to={item.path}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg mb-1 transition-colors ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                      : 'text-gray-700 hover:bg-emerald-50'
                  }`}
                >
                  {item.icon}
                  <span className="font-medium text-sm">{item.name}</span>
                </motion.div>
              </Link>
            );
          })}
      </nav>

      {/* Educator profile / logout */}
      <div className="shrink-0 p-3 border-t border-gray-200">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-semibold text-sm shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm truncate">{displayName}</p>
            <p className="text-xs text-gray-500">Educator</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
