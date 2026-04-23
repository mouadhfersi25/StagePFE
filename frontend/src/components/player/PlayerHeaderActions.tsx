import { motion } from 'motion/react';
import { useNavigate } from 'react-router';
import { User, LogOut } from 'lucide-react';
import { useAuth } from '@/context';

type PlayerHeaderActionsProps = {
  showProfileButton?: boolean;
};

export default function PlayerHeaderActions({ showProfileButton = true }: PlayerHeaderActionsProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex items-center gap-2">
      {showProfileButton && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/player/profile')}
          className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/20 bg-white/10 text-white hover:bg-white/20 transition-colors"
        >
          <User className="w-4 h-4" />
          <span className="text-sm font-semibold">Profil</span>
        </motion.button>
      )}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleLogout}
        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-rose-300/40 bg-rose-500/20 text-rose-100 hover:bg-rose-500/30 transition-colors"
      >
        <LogOut className="w-4 h-4" />
        <span className="text-sm font-semibold">Déconnexion</span>
      </motion.button>
    </div>
  );
}

