import { Link, useLocation } from 'react-router';
import { motion } from 'motion/react';
import {
  LayoutDashboard,
  HelpCircle,
  Gamepad2,
  BarChart3,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/context';
import { useNavigate } from 'react-router';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', path: '/educator/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { name: 'Question Bank', path: '/educator/questions', icon: <HelpCircle className="w-5 h-5" /> },
  { name: 'Games', path: '/educator/games', icon: <Gamepad2 className="w-5 h-5" /> },
  { name: 'Statistics', path: '/educator/statistics', icon: <BarChart3 className="w-5 h-5" /> },
];

export default function EducatorSidebar() {
  const location = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
            <span className="text-2xl">📚</span>
          </div>
          <div>
            <h2 className="font-bold text-gray-900">Educator Panel</h2>
            <p className="text-xs text-gray-500">EduGame AI</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path}>
              <motion.div
                whileHover={{ x: 4 }}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg mb-1 transition-colors ${
                  isActive
                    ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.icon}
                <span className="font-medium text-sm">{item.name}</span>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <div className="p-3">
        <motion.button
          whileHover={{ x: 4 }}
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-3 rounded-lg text-red-600 hover:bg-red-50 w-full transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-sm">Logout</span>
        </motion.button>
      </div>
    </div>
  );
}
