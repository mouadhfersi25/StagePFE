import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Pencil, Trash2, Loader2, Award } from 'lucide-react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import adminApi from '@/api/admin';
import type { BadgeDTO } from '@/api/types/api.types';
import { BADGE_CONDITION_OPTIONS } from '@/api/types/api.types';

function getConditionLabel(b: BadgeDTO): string {
  const type = (b.typeCondition || 'SCORE_MIN').toUpperCase();
  const opt = BADGE_CONDITION_OPTIONS.find((o) => o.value === type);
  const label = opt?.label ?? type;
  if (opt?.needsValue && b.scoreCondition != null) {
    if (type === 'SCORE_MIN') return `Score ≥ ${b.scoreCondition}`;
    if (type === 'GAMES_PLAYED') return `Jouer ${b.scoreCondition} partie(s)`;
    if (type === 'STREAK_DAYS') return `Série de ${b.scoreCondition} jour(s)`;
    return `${label} : ${b.scoreCondition}`;
  }
  return label;
}

const ACCENTS = [
  { gradient: 'from-amber-400 via-orange-500 to-rose-500', bg: 'bg-amber-500/10', border: 'border-amber-400/30', text: 'text-amber-700' },
  { gradient: 'from-orange-500 via-rose-500 to-pink-500', bg: 'bg-rose-500/10', border: 'border-rose-400/30', text: 'text-rose-700' },
  { gradient: 'from-rose-500 via-pink-500 to-fuchsia-500', bg: 'bg-pink-500/10', border: 'border-pink-400/30', text: 'text-pink-700' },
  { gradient: 'from-amber-500 via-yellow-500 to-orange-400', bg: 'bg-yellow-500/10', border: 'border-yellow-400/30', text: 'text-amber-800' },
];

export default function Badges() {
  const navigate = useNavigate();
  const [badges, setBadges] = useState<BadgeDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    adminApi
      .getBadges()
      .then((res) => {
        if (!cancelled) setBadges(res.data ?? []);
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || err.message || 'Erreur lors du chargement');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const handleDelete = (badge: BadgeDTO) => {
    if (!confirm(`Supprimer le badge « ${badge.nom} » ?`)) return;
    setDeletingId(badge.id);
    adminApi
      .deleteBadge(badge.id)
      .then(() => {
        setBadges((prev) => prev.filter((b) => b.id !== badge.id));
        toast.success('Badge supprimé');
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || err.message || 'Erreur lors de la suppression');
      })
      .finally(() => setDeletingId(null));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-amber-50/30">
      {/* Header */}
      <div className="border-b border-slate-200/80 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Gestion des badges
              </h1>
              <p className="mt-1 text-slate-600 text-sm sm:text-base">
                Créez et gérez les badges de réussite pour les joueurs
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/admin/badges/add')}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-orange-500 to-rose-500 shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/30 transition-all duration-200"
            >
              <Plus className="w-5 h-5" />
              Ajouter un badge
            </motion.button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200/80 text-red-700 rounded-xl text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
            <p className="text-slate-500 text-sm">Chargement des badges…</p>
          </div>
        ) : badges.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 px-4 text-center"
          >
            <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-6">
              <Award className="w-10 h-10 text-slate-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Aucun badge pour l’instant</h2>
            <p className="text-slate-600 text-sm max-w-sm mb-6">
              Créez votre premier badge pour récompenser les joueurs et afficher les conditions de déblocage.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/admin/badges/add')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-white bg-gradient-to-r from-orange-500 to-rose-500 shadow-md"
            >
              <Plus className="w-5 h-5" />
              Créer un badge
            </motion.button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {badges.map((badge, index) => {
              const style = ACCENTS[index % ACCENTS.length];
              return (
                <motion.article
                  key={badge.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                  className="relative flex flex-col bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl border border-slate-200/60 transition-all duration-300"
                >
                  {/* Barre d’accent en haut */}
                  <div className={`h-2 w-full bg-gradient-to-r ${style.gradient}`} />

                  <div className="flex-1 flex flex-col p-6">
                    {/* Icône + actions */}
                    <div className="flex items-start justify-between gap-3 mb-5">
                      <div
                        className={`flex-shrink-0 w-20 h-20 rounded-2xl bg-gradient-to-br ${style.gradient} flex items-center justify-center text-4xl shadow-lg ring-4 ring-white`}
                      >
                        {badge.icone || '🏆'}
                      </div>
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => navigate(`/admin/badges/${badge.id}/edit`)}
                          className="p-2.5 rounded-xl bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-600 transition-colors"
                          title="Modifier"
                        >
                          <Pencil className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDelete(badge)}
                          disabled={deletingId === badge.id}
                          className="p-2.5 rounded-xl bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-600 transition-colors disabled:opacity-50"
                          title="Supprimer"
                        >
                          {deletingId === badge.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </motion.button>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1 leading-tight">
                      {badge.nom}
                    </h3>
                    <p className="text-sm text-slate-600 mb-4 line-clamp-2 leading-relaxed flex-1">
                      {badge.description || 'Aucune description'}
                    </p>

                    {/* Condition */}
                    <div
                      className={`flex items-center gap-2.5 py-3 px-4 rounded-xl border-l-4 ${style.bg} ${style.border} ${style.text}`}
                    >
                      <span className="text-xs font-semibold uppercase tracking-wide opacity-80">
                        Condition
                      </span>
                      <span className="text-sm font-medium truncate">
                        {getConditionLabel(badge)}
                      </span>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
