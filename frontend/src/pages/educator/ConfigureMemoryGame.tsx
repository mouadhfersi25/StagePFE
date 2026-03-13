import { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import EducatorSidebar from '@/components/educator/EducatorSidebar';
import educatorApi from '@/api/educator/educator.api';
import type { GameDTO, MemoryCardDTO } from '@/api/types/api.types';

/** Une ligne = une paire. Champs alignés sur CreateMemoryCardRequest / MemoryCardDTO (symbole, pairKey, categorie). */
type PairRow = {
  pairKey: string;
  categorie: string;
  card1: { id?: number; symbole: string };
  card2: { id?: number; symbole: string };
};

/** Icônes (emojis) uniquement : l’éducateur choisit des icônes, le joueur joue avec des icônes. */
const ICON_PICKER = [
  '🍎', '🍐', '🍊', '🍋', '🍌', '🥝', '🍑', '🍒', '🍓', '🥥', '🍇', '🍈', '🍉', '🫐', '🥑', '🍆',
  '🦁', '🐘', '🐼', '🦊', '🐸', '🐙', '🦋', '🐢', '🐶', '🐱', '🐰', '🐻', '🐨', '🐯', '🐮', '🐷',
  '🎮', '🎯', '🎨', '🎭', '🎪', '🎸', '🎺', '🎹', '⭐', '🔥', '💎', '🌈', '🌍', '🎃', '🎄', '❤️',
];

/** Catégories proposées dans la liste déroulante (alignées aux types d'icônes). */
const CATEGORIES_PREDEFINED = ['Fruits', 'Animaux', 'Objets', 'Symboles', 'Divers'] as const;

/** Afficher uniquement une icône (emoji). Si c’est du texte (ex. ancien import), on affiche ? pour inviter à choisir une icône. */
function displayIcon(symbole: string): string {
  if (!symbole) return '?';
  if (ICON_PICKER.includes(symbole)) return symbole;
  if (/^\p{Emoji}$/u.test(symbole)) return symbole;
  return '?';
}

function groupCardsIntoPairs(cards: MemoryCardDTO[]): PairRow[] {
  const byKey = new Map<string, MemoryCardDTO[]>();
  for (const c of cards) {
    const k = c.pairKey ?? `orphan-${c.id}`;
    if (!byKey.has(k)) byKey.set(k, []);
    byKey.get(k)!.push(c);
  }
  const pairs: PairRow[] = [];
  byKey.forEach((list, key) => {
    const cat = list[0]?.categorie ?? '';
    if (list.length >= 2) {
      pairs.push({
        pairKey: key,
        categorie: cat,
        card1: { id: list[0].id, symbole: list[0].symbole },
        card2: { id: list[1].id, symbole: list[1].symbole },
      });
    } else if (list.length === 1) {
      pairs.push({
        pairKey: key,
        categorie: cat,
        card1: { id: list[0].id, symbole: list[0].symbole },
        card2: { symbole: '' },
      });
    }
  });
  return pairs;
}

export default function ConfigureMemoryGame() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const id = gameId != null ? Number(gameId) : NaN;
  const [game, setGame] = useState<GameDTO | null>(null);
  const [pairs, setPairs] = useState<PairRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [pickerFor, setPickerFor] = useState<{ index: number; side: 1 | 2 } | null>(null);

  /** Liste déroulante catégorie : prédéfinies + catégories déjà utilisées dans les paires. */
  const categoryOptions = useMemo(() => {
    const fromPairs = pairs.map((p) => p.categorie?.trim()).filter(Boolean) as string[];
    const combined = [...CATEGORIES_PREDEFINED, ...fromPairs];
    return [...new Set(combined)].sort((a, b) => a.localeCompare(b));
  }, [pairs]);

  useEffect(() => {
    if (!Number.isFinite(id)) {
      setLoading(false);
      setError('Invalid game id');
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([educatorApi.getGameById(id), educatorApi.getMemoryCards(id)])
      .then(([gameRes, cardsRes]) => {
        if (cancelled) return;
        const g = gameRes.data;
        if (!g || g.typeJeu !== 'MEMOIRE') {
          setError('Jeu introuvable ou pas un jeu Memory.');
          setGame(null);
          setPairs([]);
        } else {
          setGame(g);
          const list = Array.isArray(cardsRes.data) ? cardsRes.data : [];
          setPairs(groupCardsIntoPairs(list));
        }
        setLoading(false);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.response?.data?.message ?? err?.message ?? 'Erreur de chargement.');
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [id]);

  const addPair = () => {
    setPairs((prev) => [
      ...prev,
      {
        pairKey: `pair-${Date.now()}`,
        categorie: '',
        card1: { symbole: '' },
        card2: { symbole: '' },
      },
    ]);
  };

  const updatePair = (index: number, side: 1 | 2, value: string) => {
    setPairs((prev) => {
      const next = [...prev];
      const p = { ...next[index] };
      if (side === 1) p.card1 = { ...p.card1, symbole: value };
      else p.card2 = { ...p.card2, symbole: value };
      next[index] = p;
      return next;
    });
  };

  const updatePairField = (index: number, field: 'pairKey' | 'categorie', value: string) => {
    setPairs((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const removePair = async (index: number) => {
    const row = pairs[index];
    if (row.card1.id != null) {
      try { await educatorApi.deleteMemoryCard(row.card1.id); } catch (_) {}
    }
    if (row.card2.id != null) {
      try { await educatorApi.deleteMemoryCard(row.card2.id); } catch (_) {}
    }
    await refreshPairs();
    toast.success('Paire supprimée.');
  };

  const refreshPairs = async () => {
    if (!game) return;
    const cardsRes = await educatorApi.getMemoryCards(game.id);
    const list = Array.isArray(cardsRes.data) ? cardsRes.data : [];
    setPairs(groupCardsIntoPairs(list));
  };

  const savePair = async (index: number) => {
    if (!game) return;
    const row = pairs[index];
    const s1 = (row.card1.symbole ?? '').trim();
    const s2 = (row.card2.symbole ?? '').trim();
    if (!s1 || !s2) {
      toast.error('Choisissez une icône pour chaque carte.');
      return;
    }
    setSaving(true);
    try {
      const key = (row.pairKey ?? '').trim() || `pair-${Date.now()}-${index}`;
      const categorie = (row.categorie ?? '').trim() || undefined;

      if (row.card1.id != null && row.card2.id != null) {
        await educatorApi.updateMemoryCard(row.card1.id, { symbole: s1, pairKey: key, categorie: categorie ?? null });
        await educatorApi.updateMemoryCard(row.card2.id, { symbole: s2, pairKey: key, categorie: categorie ?? null });
        toast.success('Paire modifiée.');
      } else {
        await educatorApi.createMemoryCard({ jeuId: game.id, symbole: s1, pairKey: key, categorie: categorie ?? null });
        await educatorApi.createMemoryCard({ jeuId: game.id, symbole: s2, pairKey: key, categorie: categorie ?? null });
        toast.success('Paire ajoutée au jeu.');
      }
      await refreshPairs();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ?? (err as { message?: string })?.message ?? 'Erreur.';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const selectIcon = (icon: string) => {
    if (pickerFor == null) return;
    updatePair(pickerFor.index, pickerFor.side, icon);
    setPickerFor(null);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <EducatorSidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-600">Chargement…</p>
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <EducatorSidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-600">{error ?? 'Jeu introuvable.'}</p>
          <button onClick={() => navigate('/educator/games')} className="ml-4 text-green-600 hover:underline">
            Retour aux jeux
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <EducatorSidebar />

      <div className="flex-1 overflow-auto">
        <div className="p-8 max-w-2xl">
          <button
            onClick={() => navigate('/educator/games')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux jeux
          </button>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">{game.titre} — Paires (icônes)</h1>
          <p className="text-sm text-gray-500 mb-6">
            Cliquez sur chaque case pour choisir une icône (emoji). Un « ? » signifie qu’il faut choisir une icône. Le joueur verra uniquement des icônes dans le jeu.
          </p>

          <div className="flex items-center gap-3 mb-6">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={addPair}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Ajouter une paire
            </motion.button>
          </div>

          <div className="space-y-3">
            {pairs.map((row, index) => (
              <div
                key={row.pairKey + index}
                className="flex flex-wrap items-center gap-3 p-3 bg-white rounded-xl border border-gray-200"
              >
                {/* Symbole 1 (carte 1) */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-500">Symbole 1</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setPickerFor(pickerFor?.index === index && pickerFor?.side === 1 ? null : { index, side: 1 })}
                    className="w-14 h-14 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-3xl bg-gray-50 hover:border-purple-400 hover:bg-purple-50 transition-colors"
                    title="Choisir une icône"
                  >
                    {displayIcon(row.card1.symbole)}
                  </button>
                  {pickerFor?.index === index && pickerFor?.side === 1 && (
                    <div className="absolute left-0 top-full mt-1 z-10 p-3 bg-white rounded-xl shadow-lg border border-gray-200 min-w-[200px] max-h-64 overflow-y-auto">
                      <div className="grid grid-cols-6 gap-2" style={{ width: 'max-content' }}>
                        {ICON_PICKER.map((icon) => (
                          <button
                            key={icon}
                            type="button"
                            onClick={() => selectIcon(icon)}
                            className="min-w-[36px] min-h-[36px] w-9 h-9 flex items-center justify-center text-2xl hover:bg-purple-100 rounded-lg flex-shrink-0"
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                </div>
                <span className="text-gray-400 text-xl self-end pb-2">↔</span>
                {/* Symbole 2 (carte 2) */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-500">Symbole 2</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setPickerFor(pickerFor?.index === index && pickerFor?.side === 2 ? null : { index, side: 2 })}
                    className="w-14 h-14 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-3xl bg-gray-50 hover:border-purple-400 hover:bg-purple-50 transition-colors"
                    title="Choisir une icône"
                  >
                    {displayIcon(row.card2.symbole)}
                  </button>
                  {pickerFor?.index === index && pickerFor?.side === 2 && (
                    <div className="absolute left-0 top-full mt-1 z-10 p-3 bg-white rounded-xl shadow-lg border border-gray-200 min-w-[200px] max-h-64 overflow-y-auto">
                      <div className="grid grid-cols-6 gap-2" style={{ width: 'max-content' }}>
                        {ICON_PICKER.map((icon) => (
                          <button
                            key={icon}
                            type="button"
                            onClick={() => selectIcon(icon)}
                            className="min-w-[36px] min-h-[36px] w-9 h-9 flex items-center justify-center text-2xl hover:bg-purple-100 rounded-lg flex-shrink-0"
                          >
                            {icon}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                </div>
                {/* Catégorie (optionnel) — liste déroulante selon icônes / existantes */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-500">Catégorie</label>
                  <select
                    value={row.categorie}
                    onChange={(e) => updatePairField(index, 'categorie', e.target.value)}
                    className="w-36 px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                  >
                    <option value="">— Optionnel —</option>
                    {categoryOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => savePair(index)}
                  disabled={saving}
                  className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  Enregistrer
                </button>
                <button
                  type="button"
                  onClick={() => removePair(index)}
                  disabled={saving}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
