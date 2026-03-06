import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Save } from 'lucide-react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useAdminData } from '@/context';

const badgeIcons = ['🏆', '🎮', '🎯', '🔥', '⚡', '📚', '🧠', '🧩', '💯', '⭐', '🌟', '🎖️'];

export default function AddBadge() {
  const navigate = useNavigate();
  const { badges, setBadges } = useAdminData();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '🏆',
    unlockCondition: '',
  });

  const nextBadgeId = () => {
    const numericIds = badges
      .map((b) => b.id.replace(/^b(\d+)$/, '$1'))
      .filter((id) => /^\d+$/.test(id))
      .map((n) => parseInt(n, 10));
    const max = numericIds.length ? Math.max(...numericIds) : 0;
    return `b${max + 1}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newBadge = {
      id: nextBadgeId(),
      name: formData.name,
      description: formData.description,
      icon: formData.icon,
      unlockCondition: formData.unlockCondition,
      earned: false,
    };
    setBadges((prev) => [...prev, newBadge]);
    toast.success('Badge created successfully!');
    navigate('/admin/badges');
  };

  return (
    <div className="p-8">
          <div className="mb-6">
            <button
              onClick={() => navigate('/admin/badges')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Badges
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Add New Badge</h1>
            <p className="text-gray-600 mt-1">Create a new achievement badge for players.</p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 max-w-2xl"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Badge Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., First Win"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[80px]"
                  placeholder="Describe the achievement..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Unlock Condition *</label>
                <input
                  type="text"
                  value={formData.unlockCondition}
                  onChange={(e) => setFormData({ ...formData, unlockCondition: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., Win 1 game"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Icon *</label>
                <div className="flex flex-wrap gap-2">
                  {badgeIcons.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon })}
                      className={`w-12 h-12 flex items-center justify-center text-2xl rounded-lg border-2 transition-all ${
                        formData.icon === icon ? 'border-orange-500 bg-orange-50 scale-110' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-shadow font-medium"
                >
                  <Save className="w-4 h-4" />
                  Create Badge
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => navigate('/admin/badges')}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </motion.button>
              </div>
            </form>
          </motion.div>
    </div>
  );
}
