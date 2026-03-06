import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Calendar, Edit, Loader2, Tag, Target, Zap } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import adminApi from '@/api/admin';
import type { GameDTO } from '@/api/types';

const TYPE_ICONS: Record<string, string> = {
  QUIZ: '🧮',
  MEMOIRE: '🧠',
  REFLEXE: '⚡',
  LOGIQUE: '🎯',
};

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return dateStr;
  }
}

function difficultyLabel(d: number | null): string {
  if (d == null) return '—';
  if (d <= 3) return 'Facile';
  if (d <= 6) return 'Moyen';
  return 'Difficile';
}

function formatLabel(value: string | null | undefined): string {
  if (!value) return '—';
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

export default function GameDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<GameDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    adminApi
      .getGameById(Number(id))
      .then((res) => {
        if (!cancelled) setGame(res.data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || err.message || 'Jeu introuvable');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8">
        <p className="text-gray-600">{error || 'Jeu introuvable'}</p>
        <button
          onClick={() => navigate('/admin/games')}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à la liste
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-[calc(100vh-6rem)] flex flex-col">
      {/* Barre du haut */}
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={() => navigate('/admin/games')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-gray-700 font-semibold shadow-sm hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 transition-all"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          Retour à la liste des jeux
        </button>
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate(`/admin/games/${game.id}/edit`)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 text-white font-semibold shadow-sm hover:shadow-md transition-shadow"
        >
          <Edit className="w-4 h-4" />
          Modifier
        </motion.button>
      </div>

      {/* En-tête gradient */}
      <div className="h-28 rounded-2xl bg-gradient-to-br from-orange-400 via-orange-500 to-pink-500 flex items-center p-6 mb-6 shadow-lg">
        <div className="w-16 h-16 rounded-2xl bg-white/95 shadow-lg flex items-center justify-center text-3xl ring-2 ring-white/50 shrink-0">
          {game.icone ?? TYPE_ICONS[game.typeJeu] ?? '🎮'}
        </div>
        <div className="ml-4 min-w-0">
          <h1 className="text-2xl font-bold text-white drop-shadow-sm">{game.titre}</h1>
          <div className="flex flex-wrap gap-2 mt-1.5">
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-white/95 text-orange-700 shadow-sm">
              {formatLabel(game.typeJeu)}
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-white/95 text-pink-700 shadow-sm">
              {formatLabel(game.modeJeu)}
            </span>
          </div>
        </div>
      </div>

      {/* Description + Infos côte à côte : même hauteur pour remplir l'espace */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 flex-1 min-h-0">
        {/* Description — s'étire sur toute la hauteur de la rangée */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col min-h-[280px] lg:min-h-0"
        >
          <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Description du jeu</p>
          <p className="text-gray-600 text-base leading-relaxed whitespace-pre-wrap flex-1">
            {game.description || 'Aucune description.'}
          </p>
        </motion.section>

        {/* Infos 2×2 — même hauteur que la description */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[280px] lg:min-h-0"
        >
          <div className="grid grid-cols-2 divide-x divide-y divide-gray-100 flex-1">
            <div className="p-6 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${game.actif ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                <Tag className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</p>
                <p className={`font-semibold ${game.actif ? 'text-green-700' : 'text-gray-600'}`}>
                  {game.actif ? 'Visible pour les joueurs' : 'Masqué'}
                </p>
              </div>
            </div>
            <div className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <Target className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Difficulté</p>
                <p className="font-semibold text-gray-900 text-lg">{difficultyLabel(game.difficulte)}</p>
              </div>
            </div>
            <div className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                <Zap className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tranche d'âge</p>
                <p className="font-semibold text-gray-900 text-lg">
                  {game.ageMin != null && game.ageMax != null ? `${game.ageMin}–${game.ageMax} ans` : '—'}
                </p>
              </div>
            </div>
            <div className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Date de création</p>
                <p className="font-semibold text-gray-900">{formatDateTime(game.dateCreation)}</p>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
