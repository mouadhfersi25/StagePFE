import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import EducatorSidebar from '@/components/educator/EducatorSidebar';
import EducatorHeader from '@/components/educator/EducatorHeader';
import educatorApi from '@/api/educator/educator.api';
import type { GameDTO, LogicPuzzleDTO, LogicPuzzleData } from '@/api/types';

type LogicSubtype = 'SUITE_LOGIQUE' | 'INTRUS' | 'DEDUCTION';

type PuzzleForm = {
  id?: number;
  subtype: LogicSubtype;
  enonce: string;
  sequence: string;
  options: string;
  bonneReponse: string;
  indice: string;
  difficulte: number;
};

const subtypeLabels: Record<LogicSubtype, string> = {
  SUITE_LOGIQUE: 'Suite logique',
  INTRUS: "Trouver l'intrus",
  DEDUCTION: 'Déduction',
};

function parseData(raw: string | null): LogicPuzzleData {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as LogicPuzzleData;
  } catch {
    return {};
  }
}

export default function ConfigureLogicGame() {
  const navigate = useNavigate();
  const { gameId } = useParams();
  const id = gameId != null ? Number(gameId) : NaN;

  const [game, setGame] = useState<GameDTO | null>(null);
  const [rows, setRows] = useState<PuzzleForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canEdit = game?.etat === 'BROUILLON' || game?.etat === 'REFUSE';

  useEffect(() => {
    if (!Number.isFinite(id)) {
      setLoading(false);
      setError('Identifiant jeu invalide');
      return;
    }
    let cancelled = false;
    setLoading(true);
    Promise.all([
      educatorApi.getGameById(id),
      educatorApi.getLogicPuzzles(id),
    ])
      .then(([gRes, pRes]) => {
        if (cancelled) return;
        const g = gRes.data;
        if (!g || g.typeJeu !== 'LOGIQUE') {
          setError("Jeu introuvable ou ce n'est pas un jeu logique");
          setGame(null);
          setRows([]);
          return;
        }
        setGame(g);
        const list = Array.isArray(pRes.data) ? pRes.data : [];
        setRows(list.map((p) => {
          const data = parseData(p.donnees);
          const subtype = ((p.sousType as LogicSubtype) || (data.type as LogicSubtype) || 'DEDUCTION');
          return {
            id: p.id,
            subtype,
            enonce: p.enonce || '',
            sequence: Array.isArray(data.sequence) ? data.sequence.join(', ') : '',
            options: Array.isArray(data.options) ? data.options.join('\n') : '',
            bonneReponse: p.bonneReponse || '',
            indice: p.indice || '',
            difficulte: p.difficulte ?? 5,
          };
        }));
      })
      .catch((err) => {
        if (!cancelled) setError(err?.response?.data?.message ?? err?.message ?? 'Erreur chargement');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [id]);

  const emptyRow = useMemo<PuzzleForm>(() => ({
    subtype: 'DEDUCTION',
    enonce: '',
    sequence: '',
    options: '',
    bonneReponse: '',
    indice: '',
    difficulte: 5,
  }), []);

  const addRow = () => {
    setRows((prev) => [{ ...emptyRow }, ...prev]);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const updateRow = (index: number, patch: Partial<PuzzleForm>) => {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  };

  const toPayload = (r: PuzzleForm) => {
    const options = r.options.split('\n').map((v) => v.trim()).filter(Boolean);
    const sequence = r.sequence.split(',').map((v) => v.trim()).filter(Boolean);
    const data: LogicPuzzleData = {};
    if (r.subtype === 'SUITE_LOGIQUE') data.sequence = sequence;
    if (r.subtype === 'INTRUS' || r.subtype === 'DEDUCTION') data.options = options;

    return {
      enonce: r.enonce.trim(),
      sousType: r.subtype,
      bonneReponse: r.bonneReponse.trim(),
      indice: r.indice.trim() || null,
      difficulte: Math.max(0, Math.min(10, r.difficulte || 0)),
      donnees: JSON.stringify(data),
    };
  };

  const saveRow = async (index: number) => {
    if (!game || !canEdit) return;
    const row = rows[index];
    if (!row.enonce.trim() || !row.bonneReponse.trim()) {
      toast.error('Énoncé et bonne réponse sont requis');
      return;
    }
    if (row.subtype === 'SUITE_LOGIQUE' && row.sequence.split(',').map((v) => v.trim()).filter(Boolean).length < 3) {
      toast.error('La suite logique doit contenir au moins 3 éléments');
      return;
    }
    if ((row.subtype === 'INTRUS' || row.subtype === 'DEDUCTION') && row.options.split('\n').map((v) => v.trim()).filter(Boolean).length < 2) {
      toast.error('Ajoutez au moins 2 options');
      return;
    }
    setSaving(true);
    try {
      const payload = toPayload(row);
      if (row.id) {
        await educatorApi.updateLogicPuzzle(row.id, payload);
        toast.success('Puzzle logique modifié');
      } else {
        const created = await educatorApi.createLogicPuzzle({ jeuId: game.id, ...payload });
        updateRow(index, { id: created.data.id });
        toast.success('Puzzle logique ajouté');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Erreur sauvegarde puzzle');
    } finally {
      setSaving(false);
    }
  };

  const deleteRow = async (index: number) => {
    if (!canEdit) return;
    const row = rows[index];
    if (!row.id) {
      setRows((prev) => prev.filter((_, i) => i !== index));
      return;
    }
    if (!confirm('Supprimer ce puzzle logique ?')) return;
    setSaving(true);
    try {
      await educatorApi.deleteLogicPuzzle(row.id);
      setRows((prev) => prev.filter((_, i) => i !== index));
      toast.success('Puzzle supprimé');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Erreur suppression puzzle');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <EducatorSidebar />
        <EducatorHeader />
        <div className="flex-1 flex items-center justify-center"><p>Chargement...</p></div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <EducatorSidebar />
        <EducatorHeader />
        <div className="flex-1 flex items-center justify-center gap-3">
          <p>{error ?? 'Jeu introuvable'}</p>
          <button onClick={() => navigate('/educator/games/manage')} className="text-emerald-600 hover:underline">Retour</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <EducatorSidebar />
      <EducatorHeader />
      <div className="flex-1 overflow-auto pt-16">
        <div className="p-6 md:p-8 max-w-5xl">
          <button
            onClick={() => navigate('/educator/games/manage')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 mb-5 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux jeux
          </button>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{game.titre} — Configuration Logique</h1>
            <p className="text-sm text-gray-500 mt-1">
              Sous-types disponibles: Suite logique, Intrus, Déduction.
            </p>
          </div>

          {!canEdit && (
            <div className="mb-5 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm">
              Jeu finalisé: configuration verrouillée.
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600"><span className="font-semibold text-gray-900">{rows.length}</span> puzzle(s)</p>
            <button
              onClick={addRow}
              disabled={!canEdit}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-60"
            >
              <Plus className="w-4 h-4" />
              Ajouter un puzzle
            </button>
          </div>

          <div className="space-y-4">
            {rows.map((row, idx) => (
              <motion.div key={`${row.id ?? 'new'}-${idx}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Sous-type</label>
                    <select
                      disabled={!canEdit}
                      value={row.subtype}
                      onChange={(e) => updateRow(idx, { subtype: e.target.value as LogicSubtype })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300"
                    >
                      {Object.entries(subtypeLabels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Difficulté (0-10)</label>
                    <input
                      type="number"
                      min={0}
                      max={10}
                      disabled={!canEdit}
                      value={row.difficulte}
                      onChange={(e) => updateRow(idx, { difficulte: Number(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300"
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Énoncé</label>
                  <textarea
                    rows={2}
                    disabled={!canEdit}
                    value={row.enonce}
                    onChange={(e) => updateRow(idx, { enonce: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300"
                  />
                </div>

                {row.subtype === 'SUITE_LOGIQUE' && (
                  <div className="mb-3">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Suite (séparée par virgules)</label>
                    <input
                      type="text"
                      disabled={!canEdit}
                      value={row.sequence}
                      onChange={(e) => updateRow(idx, { sequence: e.target.value })}
                      placeholder="2, 4, 6, 8"
                      className="w-full px-3 py-2 rounded-xl border border-gray-300"
                    />
                  </div>
                )}

                {(row.subtype === 'INTRUS' || row.subtype === 'DEDUCTION') && (
                  <div className="mb-3">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Options (une par ligne)</label>
                    <textarea
                      rows={4}
                      disabled={!canEdit}
                      value={row.options}
                      onChange={(e) => updateRow(idx, { options: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Bonne réponse</label>
                    <input
                      type="text"
                      disabled={!canEdit}
                      value={row.bonneReponse}
                      onChange={(e) => updateRow(idx, { bonneReponse: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Indice (optionnel)</label>
                    <input
                      type="text"
                      disabled={!canEdit}
                      value={row.indice}
                      onChange={(e) => updateRow(idx, { indice: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => saveRow(idx)}
                    disabled={!canEdit || saving}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-60"
                  >
                    <Save className="w-4 h-4" />
                    Enregistrer
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteRow(idx)}
                    disabled={!canEdit || saving}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-xl hover:bg-red-100 disabled:opacity-60"
                  >
                    <Trash2 className="w-4 h-4" />
                    Supprimer
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
