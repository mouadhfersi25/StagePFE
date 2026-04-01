import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate, useLocation } from 'react-router';
import { ArrowLeft, Play, Clock, Users, User as UserIcon, Filter, LogIn } from 'lucide-react';
import { useAuth } from '@/context';
import { createRoom, joinRoom, getRoom } from '@/services/roomService';
import type { Game } from '@/data/types';
import userApi from '@/api/user/user.api';
import type { GameDTO } from '@/api/types';

export default function NewGame() {
  const navigate = useNavigate();
  const location = useLocation();
  const { playerProfile } = useAuth();
  const modeFromState = (location.state as { mode?: 'Individual' | 'Collective' } | null)?.mode;

  const [selectedAge, setSelectedAge] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedMode, setSelectedMode] = useState<'Individual' | 'Collective'>(modeFromState ?? 'Individual');
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [games, setGames] = useState<Game[]>([]);

  const mapType = (typeJeu: GameDTO['typeJeu']): Game['type'] => {
    if (typeJeu === 'QUIZ') return 'quiz';
    if (typeJeu === 'MEMOIRE') return 'memory';
    if (typeJeu === 'LOGIQUE') return 'logic';
    return 'reflex';
  };

  const mapDifficulty = (difficulte: number | null | undefined): Game['difficulty'] => {
    const d = difficulte ?? 5;
    if (d <= 3) return 'Easy';
    if (d <= 6) return 'Medium';
    return 'Hard';
  };

  const toPlayerGame = (g: GameDTO): Game => ({
    id: String(g.id),
    title: g.titre,
    description: g.description || '',
    type: mapType(g.typeJeu),
    ageRange: `${g.ageMin ?? 7}-${g.ageMax ?? 18}`,
    difficulty: mapDifficulty(g.difficulte),
    estimatedTime: `${g.dureeMinutes ?? 10} min`,
    icon: g.icone || (g.typeJeu === 'QUIZ' ? '🧮' : g.typeJeu === 'MEMOIRE' ? '🧠' : g.typeJeu === 'LOGIQUE' ? '🎯' : '⚡'),
    active: g.actif,
  });

  useEffect(() => {
    if (modeFromState) setSelectedMode(modeFromState);
  }, [modeFromState]);

  useEffect(() => {
    let cancelled = false;
    userApi.getAvailableGames()
      .then((res) => {
        if (cancelled) return;
        const rows = Array.isArray(res.data) ? res.data : [];
        setGames(rows.map(toPlayerGame));
      })
      .catch(() => {
        if (!cancelled) setGames([]);
      });
    return () => { cancelled = true; };
  }, []);

  const currentPlayer = playerProfile
    ? { id: playerProfile.id, name: playerProfile.name, avatar: '👦', age: playerProfile.age }
    : { id: 'guest', name: 'Joueur', avatar: '👤', age: 12 };

  const handleJoinRoom = () => {
    setJoinError('');
    const code = joinCode.trim().toUpperCase();
    if (!code || code.length < 4) {
      setJoinError('Code invalide (min. 4 caractères)');
      return;
    }
    const room = getRoom(code);
    if (!room) {
      setJoinError('Aucune room avec ce code');
      return;
    }
    joinRoom(code, currentPlayer);
    const game = games.find((g) => g.id === room.gameId);
    if (!game) {
      setJoinError('Jeu introuvable');
      return;
    }
    navigate(`/player/waiting-room/${room.gameId}?room=${code}`, { state: { game, mode: 'Collective' as const, roomCode: code } });
  };

  const filteredGames = games.filter((game) => {
    if (selectedType !== 'all' && game.type !== selectedType) return false;
    if (selectedDifficulty !== 'all' && game.difficulty !== selectedDifficulty) return false;
    if (selectedAge !== 'all') {
      const [min, max] = game.ageRange.split('-').map(Number);
      const age = parseInt(selectedAge);
      if (age < min || age > max) return false;
    }
    return true;
  });

  const handlePlayGame = (game: Game) => {
    if (selectedMode === 'Collective') {
      const roomCode = createRoom(game.id, currentPlayer);
      navigate(`/player/waiting-room/${game.id}?room=${roomCode}`, {
        state: { game, mode: selectedMode, roomCode },
      });
    } else {
      navigate(`/player/game/${game.type}/${game.id}`, { state: { game, mode: selectedMode } });
    }
  };

  const difficultyColors = {
    Easy: 'bg-green-100 text-green-700 border-green-300',
    Medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    Hard: 'bg-red-100 text-red-700 border-red-300',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/player/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-700" />
            </motion.button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Start New Game</h1>
              <p className="text-sm text-gray-600">Choose your adventure</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mode équipe : Créer ou Rejoindre une room */}
        {selectedMode === 'Collective' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-6 shadow-lg mb-8"
          >
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Mode équipe
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-5 border border-purple-100">
                <h3 className="font-bold text-gray-900 mb-2">Créer une room</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Choisis un jeu dans la liste ci-dessous et clique sur <strong>Play</strong>. Une room sera créée et tu obtiendras un <strong>code</strong> à partager avec tes coéquipiers.
                </p>
                <p className="text-xs text-purple-600 font-medium">↓ Choisis un jeu plus bas puis clique sur Play</p>
              </div>
              <div className="bg-white rounded-xl p-5 border border-purple-100">
                <h3 className="font-bold text-gray-900 mb-2">Rejoindre une room</h3>
                <p className="text-sm text-gray-600 mb-3">Tu as reçu un code ? Saisis-le ici pour rejoindre la room.</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => { setJoinCode(e.target.value.toUpperCase()); setJoinError(''); }}
                    placeholder="Ex: ABC123"
                    maxLength={6}
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 uppercase"
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleJoinRoom}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium"
                  >
                    <LogIn className="w-4 h-4" />
                    Rejoindre
                  </motion.button>
                </div>
                {joinError && <p className="mt-1 text-sm text-red-600">{joinError}</p>}
              </div>
            </div>
          </motion.div>
        )}

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg font-bold text-gray-900">Filters</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Age Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Age Group</label>
              <select
                value={selectedAge}
                onChange={(e) => setSelectedAge(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Ages</option>
                <option value="7">7-9 years</option>
                <option value="10">10-12 years</option>
                <option value="13">13-15 years</option>
                <option value="16">16-18 years</option>
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Levels</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            {/* Game Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Game Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Types</option>
                <option value="quiz">Quiz</option>
                <option value="memory">Memory</option>
                <option value="logic">Logic</option>
                <option value="reflex">Reflex</option>
              </select>
            </div>

            {/* Mode Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mode</label>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedMode('Individual')}
                  className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                    selectedMode === 'Individual'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <UserIcon className="w-4 h-4 inline mr-1" />
                  Solo
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedMode('Collective')}
                  className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                    selectedMode === 'Collective'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Users className="w-4 h-4 inline mr-1" />
                  Équipe
                </motion.button>
              </div>
            </div>
          </div>

        </motion.div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing <span className="font-bold text-purple-600">{filteredGames.length}</span> game
            {filteredGames.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Game Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ y: -8 }}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden"
            >
              <div className="h-40 bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 flex items-center justify-center">
                <span className="text-7xl">{game.icon}</span>
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-900 flex-1">{game.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${difficultyColors[game.difficulty]}`}>
                    {game.difficulty}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{game.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <UserIcon className="w-4 h-4" />
                    <span>{game.ageRange} years</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{game.estimatedTime}</span>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePlayGame(game)}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-shadow"
                >
                  <Play className="w-5 h-5" />
                  Play Now
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredGames.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl p-12 text-center shadow-lg"
          >
            <span className="text-6xl mb-4 block">🔍</span>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No games found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your filters to see more games</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSelectedAge('all');
                setSelectedDifficulty('all');
                setSelectedType('all');
              }}
              className="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold"
            >
              Clear Filters
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
