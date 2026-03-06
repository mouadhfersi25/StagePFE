import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Edit, Trash2, Loader2, Gamepad2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import adminApi from '@/api/admin.api';
import type { GameDTO } from '@/api/api.types';

const TYPE_ICONS: Record<string, string> = {
  QUIZ: '🧮',
  MEMOIRE: '🧠',
  REFLEXE: '⚡',
  LOGIQUE: '🎯',
};

function difficultyLabel(d: number | null): string {
  if (d == null) return '—';
  if (d <= 3) return 'Facile';
  if (d <= 6) return 'Moyen';
  return 'Difficile';
}

function difficultyClass(d: number | null): string {
  if (d == null) return 'bg-gray-100 text-gray-700';
  if (d <= 3) return 'bg-green-100 text-green-700';
  if (d <= 6) return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-700';
}

function formatLabel(value: string | null | undefined): string {
  if (!value) return '—';
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

export default function Games() {
  const navigate = useNavigate();
  const [games, setGames] = useState<GameDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    adminApi
      .getGames()
      .then((res) => {
        if (!cancelled) setGames(res.data ?? []);
      })
      .catch((err) => {
        if (!cancelled) setError(err.response?.data?.message || err.message || 'Erreur lors du chargement des jeux');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const toggleGameActive = async (game: GameDTO, e: React.MouseEvent) => {
    e.stopPropagation();
    setTogglingId(game.id);
    try {
      const res = await adminApi.updateGame(game.id, { actif: !game.actif });
      setGames((prev) => prev.map((g) => (g.id === game.id ? res.data : g)));
      toast.success(game.actif ? 'Jeu désactivé.' : 'Jeu activé.');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        || (err as Error)?.message
        || 'Erreur lors du changement de statut.';
      toast.error(msg);
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (game: GameDTO, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Supprimer le jeu « ${game.titre} » ? Cette action est irréversible.`)) return;
    setDeletingId(game.id);
    try {
      await adminApi.deleteGame(game.id);
      setGames((prev) => prev.filter((g) => g.id !== game.id));
      toast.success('Jeu supprimé.');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        || (err as Error)?.message
        || 'Erreur lors de la suppression.';
      toast.error(msg);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Games</h1>
              <p className="text-gray-600">Create and manage educational games</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/admin/games/add')}
              className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-shadow font-medium"
            >
              <Plus className="w-5 h-5" />
              Add New Game
            </motion.button>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}

          {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {games.map((game, index) => (
              <motion.article
                key={game.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04, duration: 0.25 }}
                onClick={() => navigate(`/admin/games/${game.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/admin/games/${game.id}`); } }}
                className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-300 cursor-pointer"
              >
                {/* Haut de carte : icône violette + titre + type (comme la capture) */}
                <div className="p-5 flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-b from-violet-300 to-violet-600 flex items-center justify-center text-2xl shrink-0 shadow-sm">
                    {game.icone ?? TYPE_ICONS[game.typeJeu] ?? '🎮'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-900 truncate">{game.titre}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{formatLabel(game.typeJeu)}</p>
                  </div>
                </div>

                <div className="px-5 pb-5">
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 mb-4">
                    {game.description || 'Aucune description.'}
                  </p>

                  {/* Pills : difficulté (jaune), durée, tranche d'âge — style capture */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium capitalize ${difficultyClass(game.difficulte)}`}>
                      {difficultyLabel(game.difficulte).toLowerCase()}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-white border border-gray-200 text-gray-800">
                      {game.ageMin != null && game.ageMax != null ? `${game.ageMin}-${game.ageMax} ans` : '—'}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-white border border-gray-200 text-gray-800">
                      {game.dureeMinutes != null ? `${game.dureeMinutes} min` : '—'}
                    </span>
                  </div>

                  {/* Ligne "plays" comme sur la capture */}
                  <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-4">
                    <Gamepad2 className="w-4 h-4" />
                    <span>— parties</span>
                  </div>

                  {/* Bas : Active + Edit / Delete */}
                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-700">Active</span>
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.98 }}
                        onClick={(e) => toggleGameActive(game, e)}
                        disabled={togglingId === game.id}
                        className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 disabled:opacity-60 ${game.actif ? 'bg-green-500' : 'bg-slate-300'}`}
                        title={game.actif ? 'Désactiver' : 'Activer'}
                      >
                        {togglingId === game.id ? (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <Loader2 className="w-3 h-3 text-white animate-spin" />
                          </span>
                        ) : (
                          <span
                            className={`pointer-events-none absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${game.actif ? 'translate-x-5' : 'translate-x-0'}`}
                          />
                        )}
                      </motion.button>
                    </div>
                    <div className="flex gap-1.5">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(`/admin/games/${game.id}/edit`)}
                        className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => handleDelete(game, e)}
                        disabled={deletingId === game.id}
                        className="p-2 rounded-lg border border-red-200 bg-red-50/50 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                        title="Supprimer"
                      >
                        {deletingId === game.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
          )}

          {!loading && !error && games.length === 0 && (
            <div className="text-center py-12 text-gray-500 rounded-xl bg-gray-50 border border-gray-100">
              <p className="font-medium">Aucun jeu pour le moment.</p>
              <p className="text-sm mt-1">Cliquez sur « Add New Game » pour en créer un.</p>
            </div>
          )}
    </div>
  );
}
