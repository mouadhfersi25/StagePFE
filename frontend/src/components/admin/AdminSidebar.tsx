import { Link, useLocation } from 'react-router';
import { motion } from 'motion/react';
import {
  LayoutDashboard,
  Users,
  Gamepad2,
  Award,
  ShieldCheck,
  BarChart3,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/context';
import { useNavigate } from 'react-router';
import storage from '@/utils/storage';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { name: 'Manage Users', path: '/admin/players', icon: <Users className="w-5 h-5" /> },
  { name: 'Manage Games', path: '/admin/games', icon: <Gamepad2 className="w-5 h-5" /> },
  { name: 'Manage Badges', path: '/admin/badges', icon: <Award className="w-5 h-5" /> },
  { name: 'Content Moderation', path: '/admin/moderation', icon: <ShieldCheck className="w-5 h-5" /> },
  { name: 'Statistics', path: '/admin/statistics', icon: <BarChart3 className="w-5 h-5" /> },
];

export default function AdminSidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const prenom = storage.get('auth_prenom') ?? '';
  const nom = storage.get('auth_nom') ?? '';
  const email = user?.email ?? '';

  const displayName = (prenom || nom)
    ? [prenom, nom].filter(Boolean).join(' ').trim()
    : (user?.name ?? (email ? email.split('@')[0].replace(/\./g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Admin'));

  const initials = (prenom.trim() && nom.trim())
    ? (prenom.trim().charAt(0) + nom.trim().charAt(0)).toUpperCase()
    : email
      ? (email.charAt(0).toUpperCase() + (email.includes('.') ? email.split('.')[1]?.charAt(0)?.toUpperCase() ?? '' : email.charAt(1)?.toUpperCase() ?? '') || email.charAt(0).toUpperCase())
      : 'A';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="sticky top-0 w-64 h-screen bg-white border-r border-gray-200 flex flex-col shrink-0">
      {/* Logo / Brand */}
      <div className="p-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-500 rounded-lg flex items-center justify-center">
            <span className="text-2xl">🛡️</span>
          </div>
          <div>
            <h2 className="font-bold text-gray-900">Admin Panel</h2>
            <p className="text-xs text-gray-500">EduGame AI</p>
          </div>
        </div>
      </div>

      {/* Navigation — scroll si trop d’éléments */}
      <nav className="flex-1 min-h-0 px-3 overflow-y-auto py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path}>
              <motion.div
                whileHover={{ x: 4 }}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg mb-1 transition-colors ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white'
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

      {/* User profile block — toujours visible en bas sans scroller */}
      <div className="shrink-0 p-3 border-t border-gray-200">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-gray-50 transition-colors">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm truncate">{displayName}</p>
            <p className="text-xs text-gray-500">Admin</p>
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
