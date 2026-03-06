import { motion } from 'motion/react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useAdminData } from '@/context';

export default function Badges() {
  const { badges, setBadges } = useAdminData();
  const navigate = useNavigate();

  const handleDelete = (badgeId: string) => {
    if (confirm('Are you sure you want to delete this badge?')) {
      setBadges((prev) => prev.filter((b) => b.id !== badgeId));
      toast.success('Badge deleted successfully');
    }
  };

  return (
    <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Badges</h1>
              <p className="text-gray-600">Create and manage achievement badges</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/admin/badges/add')}
              className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-shadow font-medium"
            >
              <Plus className="w-5 h-5" />
              Add Badge
            </motion.button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {badges.map((badge, index) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-center"
              >
                <div className="text-5xl mb-3">{badge.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{badge.name}</h3>
                <p className="text-sm text-gray-600 mb-3 min-h-[40px]">{badge.description}</p>
                <div className="text-xs text-gray-500 mb-4 p-2 bg-gray-50 rounded">
                  {badge.unlockCondition}
                </div>
                <div className="flex gap-2 justify-center">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(`/admin/badges/${badge.id}/edit`)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDelete(badge.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
    </div>
  );
}
