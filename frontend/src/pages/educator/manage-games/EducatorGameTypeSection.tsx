import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Edit, Trash2, Loader2, Gamepad2, Layers, HelpCircle, Zap, Puzzle } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import educatorApi from '@/api/educator/educator.api';
import type { GameDTO } from '@/api/types';
import EducatorSidebar from '@/components/educator/EducatorSidebar';

const TYPE_CONFIGS: Record<string, { label: string; bg: string; icon: React.ReactNode; defaultIcon: string; path: string; dbType: string; hasContentPage: boolean }> = {
  quiz: { label: 'Quiz', bg: 'bg-emerald-500', icon: <HelpCircle className="w-5 h-5" />, defaultIcon: '🧮', path: 'questions', dbType: 'QUIZ', hasContentPage: true },
  memory: { label: 'Mémoire', bg: 'bg-purple-500', icon: <Layers className="w-5 h-5" />, defaultIcon: '🧠', path: 'configure', dbType: 'MEMOIRE', hasContentPage: true },
  reflex: { label: 'Réflexe', bg: 'bg-amber-500', icon: <Zap className="w-5 h-5" />, defaultIcon: '⚡', path: 'configure', dbType: 'REFLEXE', hasContentPage: false },
  logic: { label: 'Logique', bg: 'bg-blue-500', icon: <Puzzle className="w-5 h-5" />, defaultIcon: '🎯', path: 'configure', dbType: 'LOGIQUE', hasContentPage: false },
};

const STATUS_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  EN_ATTENTE: { label: 'En attente', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: '⏳' },
  ACCEPTE: { label: 'Accepté', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: '✅' },
  REFUSE: { label: 'Refusé', color: 'bg-rose-100 text-rose-700 border-rose-200', icon: '❌' },
};

export default function EducatorGameTypeSection() {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const [games, setGames] = useState<GameDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const config = TYPE_CONFIGS[type?.toLowerCase() || 'quiz'] || TYPE_CONFIGS.quiz;
  const dbType = config.dbType;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    educatorApi.getGames()
      .then((res) => {
        if (!cancelled) {
          const typeGames = (res.data ?? []).filter(g => g.typeJeu === dbType);
          setGames(typeGames);
        }
      })
      .catch((err) => {
        if (!cancelled) setError("Erreur lors du chargement des jeux");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [type, dbType]);

  const toggleGameActive = async (game: GameDTO, e: React.MouseEvent) => {
    e.stopPropagation();
    setTogglingId(game.id);
    try {
      const res = await educatorApi.updateGame(game.id, { actif: !game.actif });
      setGames((prev) => prev.map((g) => (g.id === game.id ? res.data : g)));
      toast.success(game.actif ? 'Jeu désactivé.' : 'Jeu activé.');
    } catch (err) {
      toast.error('Erreur lors du changement de statut.');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (game: GameDTO, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Supprimer le jeu « ${game.titre} » ?`)) return;
    setDeletingId(game.id);
    try {
      await educatorApi.deleteGame(game.id);
      setGames((prev) => prev.filter((g) => g.id !== game.id));
      toast.success('Jeu supprimé.');
    } catch (err) {
      toast.error('Erreur lors de la suppression.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <EducatorSidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 capitalize">Jeux de type: {config.label}</h1>
              <p className="text-gray-600">Gérez vos jeux {config.label} et configurez leur contenu.</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(`/educator/games/manage/add?type=${dbType}`)}
              className={`flex items-center gap-2 px-4 py-3 text-white rounded-lg shadow transition-shadow font-medium ${config.bg}`}
            >
              <Plus className="w-5 h-5" />
              Nouveau {config.label}
            </motion.button>
          </div>

          {loading && (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            </div>
          )}

          {!loading && !error && games.length === 0 && (
            <div className="text-center py-16 text-gray-500 rounded-xl bg-white border border-gray-100">
              <div className="text-5xl mb-4">{config.defaultIcon}</div>
              <p className="font-semibold text-lg">Aucun jeu {config.label} pour le moment.</p>
              <p className="text-sm mt-1">Cliquez sur « Nouveau {config.label} » pour en créer un.</p>
            </div>
          )}

          {!loading && !error && games.length > 0 && (
            <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
              {games.map((game, i) => {
                const status = STATUS_LABELS[game.etat] ?? STATUS_LABELS['EN_ATTENTE'];
                return (
                  <motion.article
                    key={game.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col"
                  >
                    <div className="p-5 flex items-start justify-between border-b border-gray-50 bg-gray-50/50">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-2xl border border-gray-100">
                          {game.icone ?? config.defaultIcon}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 max-w-[200px] truncate" title={game.titre}>{game.titre}</h3>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold mt-1 inline-block ${status.color}`}>
                            {status.icon} {status.label}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                         <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${game.actif ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                           <span className={`w-1.5 h-1.5 rounded-full ${game.actif ? 'bg-green-500' : 'bg-gray-400'}`} />
                           {game.actif ? 'Actif' : 'Inactif'}
                         </span>
                      </div>
                    </div>
                    
                    <div className="p-5 flex-1">
                      <p className="text-sm text-gray-600 line-clamp-2 mb-4 h-10">
                        {game.description || 'Aucune description.'}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <div className="text-center w-1/3 border-r border-gray-200">
                           <p className="text-[10px] uppercase font-bold text-gray-400">Diff</p>
                           <p className="font-medium text-gray-800">{game.difficulte}/10</p>
                        </div>
                        <div className="text-center w-1/3 border-r border-gray-200">
                           <p className="text-[10px] uppercase font-bold text-gray-400">Âge</p>
                           <p className="font-medium text-gray-800">{game.ageMin}-{game.ageMax}</p>
                        </div>
                        <div className="text-center w-1/3">
                           <p className="text-[10px] uppercase font-bold text-gray-400">Durée</p>
                           <p className="font-medium text-gray-800">{game.dureeMinutes}'</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border-t border-gray-100 bg-gray-50/30 flex items-center justify-between gap-2">
                       {config.hasContentPage ? (
                         <button
                           onClick={() => navigate(`/educator/games/${(type ?? 'quiz').toLowerCase()}/${game.id}/${config.path}`)}
                           className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-white rounded-lg font-medium text-sm transition-opacity hover:opacity-90 ${config.bg}`}
                         >
                           {config.icon}
                           Configurer le contenu
                         </button>
                       ) : (
                         <div className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-400 rounded-lg font-medium text-xs italic">
                           Configuration non disponible
                         </div>
                       )}
                    </div>

                    <div className="p-3 border-t border-gray-100 bg-white flex items-center justify-between gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-gray-500 ml-1">Statut:</span>
                          <button
                            onClick={(e) => toggleGameActive(game, e)}
                            disabled={togglingId === game.id}
                            className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 disabled:opacity-60 ${game.actif ? 'bg-green-500' : 'bg-slate-300'}`}
                          >
                            <span className={`pointer-events-none absolute top-0.5 left-0.5 h-3 w-3 rounded-full bg-white shadow transition-transform duration-200 ${game.actif ? 'translate-x-4' : 'translate-x-0'}`} />
                          </button>
                        </div>
                        <div className="flex items-center gap-1">
                          {game.etat !== 'REFUSE' && (
                            <button
                              onClick={() => navigate(`/educator/games/manage/${game.id}/edit`)}
                              className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Modifier les détails"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={(e) => handleDelete(game, e)}
                            disabled={deletingId === game.id}
                            className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                            title="Supprimer"
                          >
                            {deletingId === game.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
