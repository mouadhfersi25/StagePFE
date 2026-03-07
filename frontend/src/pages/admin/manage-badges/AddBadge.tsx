import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import adminApi from '@/api/admin';
import type { CreateBadgeRequest, TypeConditionBadge } from '@/api/types/api.types';
import { BADGE_CONDITION_OPTIONS } from '@/api/types/api.types';

const badgeIcons = ['🏆', '🎮', '🎯', '🔥', '⚡', '📚', '🧠', '🧩', '💯', '⭐', '🌟', '🎖️'];

export default function AddBadge() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    typeCondition: 'SCORE_MIN' as TypeConditionBadge,
    scoreCondition: '' as string | number,
    icone: '🏆',
  });

  const selectedCondition = BADGE_CONDITION_OPTIONS.find((c) => c.value === formData.typeCondition);
  const needsValue = selectedCondition?.needsValue ?? true;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: CreateBadgeRequest = {
      nom: formData.nom.trim(),
      description: formData.description.trim() || undefined,
      typeCondition: formData.typeCondition,
      icone: formData.icone || undefined,
    };
    if (needsValue) {
      const score = formData.scoreCondition === '' ? undefined : Number(formData.scoreCondition);
      if (score != null && !Number.isNaN(score)) payload.scoreCondition = score;
    }

    setLoading(true);
    adminApi
      .createBadge(payload)
      .then(() => {
        toast.success('Badge créé');
        navigate('/admin/badges');
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || err.message || 'Erreur lors de la création');
      })
      .finally(() => setLoading(false));
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
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., First Win"
                  required
                  maxLength={150}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[80px]"
                  placeholder="Describe the achievement..."
                  maxLength={255}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Condition de déblocage *</label>
                <select
                  value={formData.typeCondition}
                  onChange={(e) =>
                    setFormData({ ...formData, typeCondition: e.target.value as TypeConditionBadge, scoreCondition: '' })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                >
                  {BADGE_CONDITION_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {needsValue && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valeur {formData.typeCondition === 'SCORE_MIN' ? '(score min.)' : formData.typeCondition === 'GAMES_PLAYED' ? '(nombre de parties)' : '(nombre)'}
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.scoreCondition}
                    onChange={(e) =>
                      setFormData({ ...formData, scoreCondition: e.target.value === '' ? '' : e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder={formData.typeCondition === 'SCORE_MIN' ? 'ex. 100' : 'ex. 5'}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Icon *</label>
                <div className="flex flex-wrap gap-2">
                  {badgeIcons.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData({ ...formData, icone: icon })}
                      className={`w-12 h-12 flex items-center justify-center text-2xl rounded-lg border-2 transition-all ${
                        formData.icone === icon ? 'border-orange-500 bg-orange-50 scale-110' : 'border-gray-200 hover:border-gray-300'
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
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-shadow font-medium disabled:opacity-60"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Create Badge
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => navigate('/admin/badges')}
                  disabled={loading}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-60"
                >
                  Cancel
                </motion.button>
              </div>
            </form>
          </motion.div>
    </div>
  );
}
