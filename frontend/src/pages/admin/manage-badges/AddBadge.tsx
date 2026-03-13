import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import adminApi from '@/api/admin';
import type { CreateBadgeRequest, TypeConditionBadge } from '@/api/types/api.types';
import { BADGE_CONDITION_OPTIONS } from '@/api/types/api.types';
import {
  validateRequired,
  validateMaxLength,
  validateNonNegativeNumber,
  runValidations,
  type ValidationResult,
} from '@/utils/formValidation';

const badgeIcons = ['🏆', '🎮', '🎯', '🔥', '⚡', '📚', '🧠', '🧩', '💯', '⭐', '🌟', '🎖️'];

export default function AddBadge() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationResult>({});
  const [formData, setFormData] = useState<{
    nom: string;
    description: string;
    typeCondition: TypeConditionBadge | '';
    scoreCondition: string | number;
    icone: string;
  }>({
    nom: '',
    description: '',
    typeCondition: '',
    scoreCondition: '',
    icone: '',
  });

  const selectedCondition = formData.typeCondition ? BADGE_CONDITION_OPTIONS.find((c) => c.value === formData.typeCondition) : null;
  const needsValue = selectedCondition ? selectedCondition.needsValue : false;

  const validate = (): boolean => {
    const rules = [
      { field: 'nom', message: validateRequired(formData.nom, 'Nom du badge requis') ?? validateMaxLength(formData.nom, 150, 'Maximum 150 caractères') },
      { field: 'description', message: validateRequired(formData.description, 'La description est requise') ?? validateMaxLength(formData.description ?? '', 255, 'Maximum 255 caractères') },
      { field: 'typeCondition', message: validateRequired(formData.typeCondition, 'Choisissez une condition de déblocage') },
      { field: 'icone', message: validateRequired(formData.icone, 'Choisissez une icône') },
    ];
    if (needsValue) {
      const scoreEmpty = formData.scoreCondition === '' || formData.scoreCondition === undefined;
      const scoreErr = scoreEmpty ? 'La valeur est requise' : validateNonNegativeNumber(formData.scoreCondition, 'La valeur doit être ≥ 0');
      if (scoreErr) rules.push({ field: 'scoreCondition', message: scoreErr });
    }
    const next = runValidations(rules);
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const payload: CreateBadgeRequest = {
      nom: formData.nom.trim(),
      description: formData.description.trim() || undefined,
      typeCondition: formData.typeCondition as TypeConditionBadge,
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
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Badge Name *</label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => { setFormData({ ...formData, nom: e.target.value }); setErrors((prev) => ({ ...prev, nom: '' })); }}
                  onBlur={() => {
                    const msg = validateRequired(formData.nom, 'Nom du badge requis') ?? validateMaxLength(formData.nom, 150, 'Maximum 150 caractères');
                    setErrors((prev) => (msg ? { ...prev, nom: msg } : { ...prev, nom: '' }));
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.nom ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="e.g., First Win"
                />
                {errors.nom && <p className="mt-1 text-sm text-red-600">{errors.nom}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => { setFormData({ ...formData, description: e.target.value }); setErrors((prev) => ({ ...prev, description: '' })); }}
                  onBlur={() => {
                    const msg = validateRequired(formData.description, 'La description est requise') ?? validateMaxLength(formData.description ?? '', 255, 'Maximum 255 caractères');
                    setErrors((prev) => (msg ? { ...prev, description: msg } : { ...prev, description: '' }));
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[80px] ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Describe the achievement..."
                />
                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Condition de déblocage *</label>
                <select
                  value={formData.typeCondition}
                  onChange={(e) => {
                    setFormData({ ...formData, typeCondition: e.target.value as TypeConditionBadge | '', scoreCondition: '' });
                    setErrors((prev) => ({ ...prev, typeCondition: '' }));
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.typeCondition ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">— Choisir une condition —</option>
                  {BADGE_CONDITION_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {errors.typeCondition && <p className="mt-1 text-sm text-red-600">{errors.typeCondition}</p>}
              </div>

              {needsValue && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valeur {formData.typeCondition === 'SCORE_MIN' ? '(score min.)' : formData.typeCondition === 'GAMES_PLAYED' ? '(nombre de parties)' : '(nombre)'}
                  </label>
                  <input
                    type="number"
                    value={formData.scoreCondition}
                    onChange={(e) => {
                      setFormData({ ...formData, scoreCondition: e.target.value === '' ? '' : e.target.value });
                      setErrors((prev) => ({ ...prev, scoreCondition: '' }));
                    }}
                    onBlur={() => {
                      const empty = formData.scoreCondition === '' || formData.scoreCondition === undefined;
                      const msg = empty ? 'La valeur est requise' : validateNonNegativeNumber(formData.scoreCondition, 'La valeur doit être ≥ 0');
                      setErrors((prev) => (msg ? { ...prev, scoreCondition: msg } : { ...prev, scoreCondition: '' }));
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${errors.scoreCondition ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder={formData.typeCondition === 'SCORE_MIN' ? 'ex. 100' : 'ex. 5'}
                  />
                  {errors.scoreCondition && <p className="mt-1 text-sm text-red-600">{errors.scoreCondition}</p>}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Icon *</label>
                <div className="flex flex-wrap gap-2">
                  {badgeIcons.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => { setFormData({ ...formData, icone: icon }); setErrors((prev) => ({ ...prev, icone: '' })); }}
                      className={`w-12 h-12 flex items-center justify-center text-2xl rounded-lg border-2 transition-all ${
                        formData.icone === icon ? 'border-orange-500 bg-orange-50 scale-110' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
                {errors.icone && <p className="mt-2 text-sm text-red-600">{errors.icone}</p>}
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
