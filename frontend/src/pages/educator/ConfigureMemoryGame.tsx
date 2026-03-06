import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import EducatorSidebar from '@/components/educator/EducatorSidebar';
import { useAdminData } from '@/context';

const EMOJI_PICKER = ['🎮', '🎯', '🎨', '🎭', '🎪', '🎸', '🎺', '🎹', '🦁', '🐘', '🐼', '🦊', '🐸', '🐙', '🦋', '🐢', '⭐', '🔥', '💎', '🌈', '🌍', '🎃', '🎄', '🍎'];

export default function ConfigureMemoryGame() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { games, gameConfigs, setGameConfigs } = useAdminData();
  const game = games.find((g) => g.id === gameId);
  const config = gameId ? gameConfigs[gameId] : undefined;
  const isMemory = config?.type === 'memory';
  const initialPairs = isMemory ? (config.pairs.length >= 4 ? config.pairs : ['🎮', '🎯', '🎨', '🎭']) : ['🎮', '🎯', '🎨', '🎭', '🎪', '🎸', '🎺', '🎹'];

  const [pairs, setPairs] = useState<string[]>(initialPairs);

  useEffect(() => {
    if (!gameId) return;
    const cfg = gameConfigs[gameId];
    if (cfg?.type === 'memory' && cfg.pairs.length >= 4) {
      setPairs(cfg.pairs);
    }
  }, [gameId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameId || pairs.length < 4) {
      toast.error('Add at least 4 emojis (2 pairs minimum).');
      return;
    }
    setGameConfigs((prev) => ({
      ...prev,
      [gameId]: { type: 'memory', pairs: [...pairs] },
    }));
    toast.success('Memory game configured successfully!');
    navigate('/educator/games');
  };

  const updatePair = (index: number, emoji: string) => {
    setPairs((prev) => {
      const next = [...prev];
      next[index] = emoji;
      return next;
    });
  };

  const addPair = () => setPairs((prev) => [...prev, '⭐']);
  const removePair = (index: number) => setPairs((prev) => prev.filter((_, i) => i !== index));

  if (!game || game.type !== 'memory') {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <EducatorSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Game not found or not a memory game.</p>
            <button onClick={() => navigate('/educator/games')} className="text-green-600 hover:underline">
              Back to Games
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <EducatorSidebar />

      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="mb-6">
            <button
              onClick={() => navigate('/educator/games')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Games
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Configure Memory Game</h1>
            <p className="text-gray-600 mt-1">{game.title} – Choose the emoji pairs (each emoji appears on 2 cards).</p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 max-w-2xl"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Card pairs (emojis)</label>
                <p className="text-xs text-gray-500 mb-3">Minimum 4 emojis (2 pairs). Each emoji will appear on 2 cards.</p>
                <div className="flex flex-wrap gap-3 items-center">
                  {pairs.map((emoji, index) => (
                    <div key={index} className="flex items-center gap-1">
                      <select
                        value={emoji}
                        onChange={(e) => updatePair(index, e.target.value)}
                        className="w-14 h-12 text-2xl border border-gray-300 rounded-lg bg-white"
                      >
                        {EMOJI_PICKER.map((e) => (
                          <option key={e} value={e}>
                            {e}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => removePair(index)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addPair}
                    className="w-12 h-12 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-green-500 hover:text-green-500 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg hover:shadow-lg transition-shadow font-medium"
                >
                  <Save className="w-4 h-4" />
                  Save configuration
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => navigate('/educator/games')}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
