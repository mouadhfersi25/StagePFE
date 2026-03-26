import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Globe, Bell, Settings, LogOut, Check, X, Gamepad2, Loader2 } from 'lucide-react';
import { useAuth } from '@/context';
import storage from '@/utils/storage';
import { userService } from '@/services/user.service';
import adminApi from '@/api/admin';
import type { GameDTO, EtatJeu } from '@/api/types';
import { toast } from 'sonner';

export default function AdminHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [nameReady, setNameReady] = useState(false);
  const [pendingGames, setPendingGames] = useState<GameDTO[]>([]);
  const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);

  const avatarRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const prenom = storage.get('auth_prenom') ?? '';
  const nom = storage.get('auth_nom') ?? '';
  const email = user?.email ?? '';

  useEffect(() => {
    if (!user?.email || (prenom || nom)) return;
    userService.getProfile().then((data: { prenom?: string; nom?: string }) => {
      if (data.prenom != null) storage.set('auth_prenom', data.prenom);
      if (data.nom != null) storage.set('auth_nom', data.nom);
      setNameReady(true);
    }).catch(() => { });
  }, [user?.email]);

  const displayName = (prenom || nom)
    ? [prenom, nom].filter(Boolean).join(' ').trim()
    : (user?.name ?? (email ? email.split('@')[0].replace(/\./g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Admin'));

  const initials = (prenom.trim() && nom.trim())
    ? (prenom.trim().charAt(0) + nom.trim().charAt(0)).toUpperCase()
    : email
      ? (email.charAt(0).toUpperCase() + (email.includes('.') ? email.split('.')[1]?.charAt(0)?.toUpperCase() ?? '' : email.charAt(1)?.toUpperCase() ?? '') || email.charAt(0).toUpperCase())
      : 'A';

  const fetchPendingGames = async () => {
    try {
      const res = await adminApi.getGames();
      if (Array.isArray(res.data)) {
        const pending = (res.data as GameDTO[]).filter(g => g.etat === 'EN_ATTENTE');
        setPendingGames(pending);
      }
    } catch (err) {
      console.error("Failed to fetch pending games", err);
    }
  };

  useEffect(() => {
    fetchPendingGames();
    // Constantly refresh notifications every minute
    const interval = setInterval(fetchPendingGames, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusUpdate = async (gameId: number, status: EtatJeu) => {
    setUpdatingStatusId(gameId);
    try {
      await adminApi.updateGameStatus(gameId, status);
      toast.success(status === 'ACCEPTE' ? 'Jeu accepté' : 'Jeu refusé');
      setPendingGames(prev => prev.filter(g => g.id !== gameId));
    } catch (err) {
      toast.error("Erreur lors de la mise à jour du statut");
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleNavigateToGame = (gameId: number) => {
    setNotificationsOpen(false);
    navigate(`/admin/games/${gameId}`);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setAvatarOpen(false);
    setNotificationsOpen(false);
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
        <div className="relative shrink-0" ref={notificationsRef}>
          <button
            type="button"
            onClick={() => {
              setNotificationsOpen(o => !o);
              if (!notificationsOpen) fetchPendingGames(); // Refresh when opening
            }}
            className="relative p-2.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {pendingGames.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full" />
            )}
          </button>

          {notificationsOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border border-gray-200 shadow-xl z-50 overflow-hidden flex flex-col max-h-[400px]"
            >
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between shrink-0">
                <span className="font-semibold text-gray-900">Notifications</span>
                {pendingGames.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-xs font-bold">
                    {pendingGames.length}
                  </span>
                )}
              </div>

              <div className="overflow-y-auto custom-scrollbar">
                {pendingGames.length === 0 ? (
                  <div className="p-6 text-center text-gray-500 text-sm">
                    Aucune nouvelle notification.
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {pendingGames.map(game => (
                      <div key={game.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                            {game.icone || <Gamepad2 className="w-4 h-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <button
                              type="button"
                              onClick={() => handleNavigateToGame(game.id)}
                              className="text-left w-full"
                            >
                              <p className="text-sm font-medium text-gray-900 truncate">{game.titre}</p>
                              <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">Nouvelle demande de jeu éducatif. En attente de validation.</p>
                            </button>

                            <div className="flex items-center gap-2 mt-3">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleStatusUpdate(game.id, 'REFUSE'); }}
                                disabled={updatingStatusId === game.id}
                                className="flex-1 px-2 py-1.5 text-xs font-semibold bg-rose-50 text-rose-600 rounded-lg border border-rose-200 hover:bg-rose-100 transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                              >
                                {updatingStatusId === game.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                                Refuser
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleStatusUpdate(game.id, 'ACCEPTE'); }}
                                disabled={updatingStatusId === game.id}
                                className="flex-1 px-2 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                              >
                                {updatingStatusId === game.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                Accepter
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>
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
