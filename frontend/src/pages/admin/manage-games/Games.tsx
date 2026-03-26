import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Loader2, Gamepad2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import adminApi from '@/api/admin';
import type { GameDTO } from '@/api/types';

const TYPE_ICONS: Record<string, string> = {
  QUIZ: '🧮',
  MEMOIRE: '🧠',
  REFLEXE: '⚡',
  LOGIQUE: '🎯',
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  EN_ATTENTE: { label: 'En attente', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  ACCEPTE: { label: 'Accepté', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  REFUSE: { label: 'Refusé', color: 'bg-rose-100 text-rose-700 border-rose-200' },
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
  const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null);

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

  const handleUpdateStatus = async (id: number, etat: 'ACCEPTE' | 'REFUSE', e: React.MouseEvent) => {
    e.stopPropagation();
    setStatusUpdatingId(id);
    try {
      const res = await adminApi.updateGameStatus(id, etat);
      setGames((prev) => prev.map((g) => (g.id === id ? res.data : g)));
      toast.success(etat === 'ACCEPTE' ? 'Jeu accepté !' : 'Jeu refusé.');
    } catch (err: unknown) {
      toast.error('Erreur lors de la mise à jour du statut.');
    } finally {
      setStatusUpdatingId(null);
    }
  };

  return (
    <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Game Moderation</h1>
              <p className="text-gray-600">Review and approve games created by educators</p>
            </div>
            {/* Le bouton Add New Game est retiré pour l'admin car c'est le rôle de l'éducateur maintenant */}
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
                    <div className="flex items-center gap-2">
                       <h3 className="text-lg font-bold text-gray-900 truncate">{game.titre}</h3>
                       <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold uppercase ${STATUS_LABELS[game.etat]?.color ?? ''}`}>
                         {STATUS_LABELS[game.etat]?.label ?? game.etat}
                       </span>
                    </div>
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

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${game.actif ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${game.actif ? 'bg-green-500' : 'bg-gray-400'}`} />
                        {game.actif ? 'Actif' : 'Inactif'}
                      </span>
                    </div>

                    {game.etat === 'EN_ATTENTE' ? (
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => handleUpdateStatus(game.id, 'REFUSE', e)}
                          disabled={statusUpdatingId === game.id}
                          className="px-3 py-1.5 text-xs font-bold bg-rose-50 text-rose-600 rounded-lg border border-rose-200 hover:bg-rose-100 transition-colors disabled:opacity-50"
                        >
                          Refuser
                        </button>
                        <button
                          onClick={(e) => handleUpdateStatus(game.id, 'ACCEPTE', e)}
                          disabled={statusUpdatingId === game.id}
                          className="px-3 py-1.5 text-xs font-bold bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors disabled:opacity-50"
                        >
                          Accepter
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Lecture seule</span>
                    )}
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
