import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Calendar, Edit, Loader2, Tag, Target, Zap, Clock, Gamepad2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import adminApi from '@/api/admin';
import educatorApi from '@/api/educator/educator.api';
import type { GameDTO, EtatJeu, QuizQuestionDTO, MemoryCardDTO } from '@/api/types';

const TYPE_ICONS: Record<string, string> = {
  QUIZ: '🧮',
  MEMOIRE: '🧠',
  REFLEXE: '⚡',
  LOGIQUE: '🎯',
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  EN_ATTENTE: { label: 'En attente', color: 'bg-amber-100/90 text-amber-800 border-amber-200' },
  ACCEPTE: { label: 'Accepté', color: 'bg-emerald-100/90 text-emerald-800 border-emerald-200' },
  REFUSE: { label: 'Refusé', color: 'bg-rose-100/90 text-rose-800 border-rose-200' },
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

type MemoryPair = {
  categorie: string;
  card1: import('@/api/types').MemoryCardDTO;
  card2?: import('@/api/types').MemoryCardDTO;
};

function groupMemoryCards(cards: import('@/api/types').MemoryCardDTO[]): MemoryPair[] {
  const map = new Map<string, import('@/api/types').MemoryCardDTO[]>();
  for (const card of cards) {
    const key = card.pairKey || `pair-${card.id ?? Math.random().toString(36).slice(2)}`;
    const list = map.get(key) ?? [];
    list.push(card);
    map.set(key, list);
  }

  const pairs: MemoryPair[] = [];
  map.forEach((list, key) => {
    const categorie = list[0]?.categorie ?? '';
    if (list.length >= 2) {
      pairs.push({ categorie, card1: list[0], card2: list[1] });
    } else {
      pairs.push({ categorie, card1: list[0], card2: undefined });
    }
  });

  // Garder l'ordre par clé / id pour stabilité
  return pairs.sort((a, b) => (a.card1.id ?? 0) - (b.card1.id ?? 0));
}

export default function GameDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<GameDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contentError, setContentError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [contentLoading, setContentLoading] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestionDTO[]>([]);
  const [memoryCards, setMemoryCards] = useState<MemoryCardDTO[]>([]);

  const handleStatusUpdate = async (status: EtatJeu) => {
    if (!game) return;
    setUpdatingStatus(true);
    try {
      await adminApi.updateGameStatus(game.id, status);
      setGame({ ...game, etat: status });
      toast.success(status === 'ACCEPTE' ? 'Jeu accepté' : 'Jeu refusé');
    } catch (err) {
      toast.error('Erreur lors de la mise à jour du statut');
    } finally {
      setUpdatingStatus(false);
    }
  };

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

  useEffect(() => {
    const loadContent = async () => {
      if (!game) return;
      setContentLoading(true);
      setContentError(null);

      try {
        if (game.typeJeu === 'QUIZ') {
          const res = await adminApi.getGameQuestions(game.id);
          setQuizQuestions(Array.isArray(res.data) ? res.data : []);
          if (!Array.isArray(res.data) || res.data.length === 0) {
            const fallback = await educatorApi.getQuestions(game.id);
            setQuizQuestions(Array.isArray(fallback.data) ? fallback.data : []);
          }
        } else if (game.typeJeu === 'MEMOIRE') {
          const res = await adminApi.getGameMemoryCards(game.id);
          setMemoryCards(Array.isArray(res.data) ? res.data : []);
          if (!Array.isArray(res.data) || res.data.length === 0) {
            const fallback = await educatorApi.getMemoryCards(game.id);
            setMemoryCards(Array.isArray(fallback.data) ? fallback.data : []);
          }
        } else {
          setQuizQuestions([]);
          setMemoryCards([]);
        }
      } catch (err: any) {
        const status = err?.response?.status;
        const serverMessage = err?.response?.data?.message || err?.message;
        if (status === 403) {
          setContentError('Accès refusé admin => contenu (403). Essayez /educator pour vérifier le role.');
        } else {
          setContentError(`Impossible de charger le contenu du jeu. ${serverMessage ?? ''}`);
        }
      } finally {
        setContentLoading(false);
      }
    };
    loadContent();
  }, [game]);

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
      <div className="flex items-center justify-between mb-6 gap-4">
        <button
          type="button"
          onClick={() => navigate('/admin/games')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-gray-700 font-semibold shadow-sm hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1 transition-all"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          Retour à la liste des jeux
        </button>

        {game?.etat === 'EN_ATTENTE' && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleStatusUpdate('REFUSE')}
              disabled={updatingStatus}
              className="px-3 py-2 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 text-sm font-semibold hover:bg-rose-100 disabled:opacity-60"
            >
              {updatingStatus ? 'Traitement...' : 'Refuser'}
            </button>
            <button
              type="button"
              onClick={() => handleStatusUpdate('ACCEPTE')}
              disabled={updatingStatus}
              className="px-3 py-2 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-600 text-sm font-semibold hover:bg-emerald-100 disabled:opacity-60"
            >
              {updatingStatus ? 'Traitement...' : 'Accepter'}
            </button>
          </div>
        )}
      </div>

      {/* En-tête gradient */}
      <div className="h-28 rounded-2xl bg-gradient-to-br from-orange-400 via-orange-500 to-pink-500 flex items-center p-6 mb-6 shadow-lg">
        <div className="w-16 h-16 rounded-2xl bg-white/95 shadow-lg flex items-center justify-center text-3xl ring-2 ring-white/50 shrink-0">
          {game.icone ?? TYPE_ICONS[game.typeJeu] ?? '🎮'}
        </div>
        <div className="ml-4 flex-1 min-w-0">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-2xl font-bold text-white drop-shadow-sm truncate">{game.titre}</h1>
            <span className={`text-xs px-2.5 py-1 rounded-full border shadow-sm font-bold uppercase ${STATUS_LABELS[game.etat]?.color ?? ''}`}>
              {STATUS_LABELS[game.etat]?.label ?? game.etat}
            </span>
          </div>
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

        {/* Infos 2×3 — même hauteur que la description */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[280px] lg:min-h-0"
        >
          <div className="grid grid-cols-2 lg:grid-cols-2 divide-x divide-y divide-gray-100 flex-1">
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
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Durée estimée</p>
                <p className="font-semibold text-gray-900 text-lg">
                  {game.dureeMinutes != null ? `${game.dureeMinutes} min` : '—'}
                </p>
              </div>
            </div>
            <div className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Création</p>
                <p className="font-semibold text-gray-900">{formatDateTime(game.dateCreation)}</p>
              </div>
            </div>
          </div>
        </motion.section>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-bold text-gray-900 mb-3">Contenu du jeu</h2>

        {contentError && (
          <div className="mb-4 p-4 rounded-lg bg-rose-50 border border-rose-100 text-rose-700">
            <p className="font-semibold">Impossible de charger le contenu du jeu</p>
            <p className="text-sm mt-1">{contentError}</p>
            {game && game.typeJeu === 'QUIZ' && (
              <button
                type="button"
                onClick={() => navigate(`/educator/games/quiz/${game.id}/questions`)}
                className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm"
              >
                Voir le contenu côté éducateur
              </button>
            )}
            {game && game.typeJeu === 'MEMOIRE' && (
              <button
                type="button"
                onClick={() => navigate(`/educator/games/memory/${game.id}/configure`)}
                className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm"
              >
                Voir le contenu côté éducateur
              </button>
            )}
          </div>
        )}

        {contentLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          </div>
        ) : game?.typeJeu === 'QUIZ' ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {quizQuestions.length === 0 ? (
              <div className="col-span-full p-5 rounded-2xl border border-dashed border-gray-300 bg-gray-50 text-center text-gray-600">
                Aucune question de quiz n'a encore été ajoutée pour ce jeu.
              </div>
            ) : (
              quizQuestions.map((q, index) => (
                <article
                  key={q.id}
                  className="rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <div className="border-b border-gray-100 px-4 py-3 bg-gradient-to-r from-orange-50 via-orange-100 to-orange-50 rounded-t-2xl">
                    <p className="text-xs uppercase tracking-wider text-orange-600 font-bold">Question {index + 1}</p>
                    <p className="mt-1 text-sm font-semibold text-gray-800 truncate">{q.contenu || '—'}</p>
                  </div>
                  <div className="p-4 space-y-3">
                    <p className="text-xs text-gray-500">Difficulté : <span className="font-bold text-gray-700">{difficultyLabel(q.difficulte)}</span></p>
                    <p className="text-sm text-gray-900"><strong className="text-gray-800">Bonne réponse :</strong> {q.bonneReponse || '—'}</p>
                    {q.options && q.options.length > 0 ? (
                      <ul className="space-y-1 text-sm text-gray-700">
                        {q.options.map((option) => (
                          <li key={option} className="flex items-start gap-2">
                            <span className="mt-1 inline-block h-2 w-2 rounded-full bg-orange-500" />
                            <span>{option}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-gray-400">Pas d'options</p>
                    )}
                    {q.explication && (
                      <p className="text-sm text-gray-500"><span className="font-semibold text-gray-700">Explication :</span> {q.explication}</p>
                    )}
                  </div>
                </article>
              ))
            )}
          </div>
        ) : game?.typeJeu === 'MEMOIRE' ? (
          <div className="space-y-3">
            {memoryCards.length === 0 ? (
              <div className="p-5 rounded-2xl border border-dashed border-gray-300 bg-gray-50 text-center text-gray-600">
                Aucune paire mémoire n'a encore été ajoutée pour ce jeu.
              </div>
            ) : (
              groupMemoryCards(memoryCards).map((pair, index) => (
                <article
                  key={`${pair.card1.id ?? index}-${pair.card2?.id ?? 'empty'}`}
                  className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-3xl">{pair.card1?.symbole || '❓'}</div>
                    <span className="text-lg text-gray-400">↔</span>
                    <div className="w-14 h-14 rounded-xl border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-3xl">{pair.card2?.symbole || '❓'}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-600 truncate">Paire {index + 1}</p>
                    <p className="text-base font-semibold text-gray-900">{pair.categorie || 'Sans catégorie'}</p>
                  </div>
                </article>
              ))
            )}
          </div>
        ) : (
          <p className="text-gray-600">Type de jeu non géré pour le pré-aperçu de contenu.</p>
        )}
      </div>
    </div>
  );
}
