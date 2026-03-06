import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Globe, Bell, Settings, LogOut } from 'lucide-react';
import { useAuth } from '@/context';
import storage from '@/utils/storage';
import { userService } from '@/services/user.service';

export default function AdminHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [nameReady, setNameReady] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);

  const prenom = storage.get('auth_prenom') ?? '';
  const nom = storage.get('auth_nom') ?? '';
  const email = user?.email ?? '';

  useEffect(() => {
    if (!user?.email || (prenom || nom)) return;
    userService.getProfile().then((data: { prenom?: string; nom?: string }) => {
      if (data.prenom != null) storage.set('auth_prenom', data.prenom);
      if (data.nom != null) storage.set('auth_nom', data.nom);
      setNameReady(true);
    }).catch(() => {});
  }, [user?.email]);

  const displayName = (prenom || nom)
    ? [prenom, nom].filter(Boolean).join(' ').trim()
    : (user?.name ?? (email ? email.split('@')[0].replace(/\./g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Admin'));

  const initials = (prenom.trim() && nom.trim())
    ? (prenom.trim().charAt(0) + nom.trim().charAt(0)).toUpperCase()
    : email
      ? (email.charAt(0).toUpperCase() + (email.includes('.') ? email.split('.')[1]?.charAt(0)?.toUpperCase() ?? '' : email.charAt(1)?.toUpperCase() ?? '') || email.charAt(0).toUpperCase())
      : 'A';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) setAvatarOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setAvatarOpen(false);
    logout();
    navigate('/login');
  };

  return (
    <header className="fixed top-0 left-64 right-0 z-50 flex items-center justify-between gap-4 px-6 py-4 bg-white border-b border-gray-100 shadow-sm">
      <div className="flex-1" />
      <div className="flex items-center gap-2">
        <button type="button" className="p-2.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors" title="Globe">
          <Globe className="w-5 h-5" />
        </button>
        <button type="button" className="relative p-2.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors" title="Notifications">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <div className="relative shrink-0" ref={avatarRef}>
          <button
            type="button"
            onClick={() => setAvatarOpen((o) => !o)}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm shrink-0 focus:outline-none"
            aria-expanded={avatarOpen}
            aria-haspopup="true"
          >
            {initials}
          </button>
          {avatarOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl border border-gray-200 shadow-xl z-50 overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                <p className="font-semibold text-gray-900">{displayName}</p>
                <p className="text-sm text-gray-500 truncate">{email}</p>
              </div>
              <div className="py-1">
                <Link
                  to="/admin/me/edit"
                  onClick={() => setAvatarOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Settings className="w-4 h-4 text-gray-500" />
                  Settings
                </Link>
                <Link
                  to="#"
                  onClick={() => setAvatarOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Bell className="w-4 h-4 text-gray-500" />
                  Notifications
                  <span className="ml-auto flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500 text-white text-xs font-medium">4</span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <LogOut className="w-4 h-4 text-gray-500" />
                  Log out
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </header>
  );
}
