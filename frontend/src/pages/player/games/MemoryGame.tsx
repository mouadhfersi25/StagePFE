import { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { useNavigate, useLocation, useParams } from 'react-router';
import { ArrowLeft, Clock, RotateCcw } from 'lucide-react';
import userApi from '@/api/user/user.api';
import type { MemoryCardDTO } from '@/api/types';

const DEFAULT_EMOJIS = ['🎮', '🎯', '🎨', '🎭', '🎪', '🎸', '🎺', '🎹'];

interface Card {
  id: number;
  emoji: string;
  pairKey: string;
  flipped: boolean;
  matched: boolean;
}

export default function MemoryGame() {
  const navigate = useNavigate();
  const location = useLocation();
  const { gameId } = useParams();
  const { game, mode } = location.state || {};
  const [memoryCards, setMemoryCards] = useState<MemoryCardDTO[]>([]);

  const emojiList = useMemo(() => {
    if (memoryCards.length >= 2) {
      return memoryCards.map((c) => c.symbole);
    }
    return DEFAULT_EMOJIS;
  }, [memoryCards]);

  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);

  const totalPairs = useMemo(() => {
    if (memoryCards.length > 0) {
      const keys = new Set(memoryCards.map((c) => c.pairKey).filter(Boolean));
      if (keys.size > 0) return keys.size;
      return Math.floor(memoryCards.length / 2);
    }
    return emojiList.length;
  }, [memoryCards, emojiList.length]);

  useEffect(() => {
    if (!gameId) return;
    let cancelled = false;
    userApi.getMemoryCardsByGame(gameId)
      .then((res) => {
        if (cancelled) return;
        const rows = Array.isArray(res.data) ? res.data : [];
        setMemoryCards(rows);
      })
      .catch(() => {
        if (!cancelled) setMemoryCards([]);
      });
    return () => { cancelled = true; };
  }, [gameId]);

  const initializeGame = () => {
    const sourceCards: Array<{ emoji: string; pairKey: string }> = memoryCards.length > 0
      ? memoryCards.map((c, index) => ({
          emoji: c.symbole,
          pairKey: c.pairKey || `pair-${Math.floor(index / 2)}`,
        }))
      : [...emojiList, ...emojiList].map((emoji, index) => ({
          emoji,
          pairKey: emoji || `pair-${Math.floor(index / 2)}`,
        }));

    const shuffledCards: Card[] = sourceCards
      .sort(() => Math.random() - 0.5)
      .map((entry, index) => ({
        id: index,
        emoji: entry.emoji,
        pairKey: entry.pairKey,
        flipped: false,
        matched: false,
      }));
    setCards(shuffledCards);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setTimeElapsed(0);
    setGameStarted(false);
  };

  useEffect(() => {
    initializeGame();
  }, [gameId, emojiList, memoryCards]);

  // Timer
  useEffect(() => {
    if (gameStarted && matches < totalPairs) {
      const timer = setInterval(() => setTimeElapsed((prev) => prev + 1), 1000);
      return () => clearInterval(timer);
    }
  }, [gameStarted, matches, totalPairs]);

  // Check for game completion
  useEffect(() => {
    if (matches === totalPairs && gameStarted) {
      setTimeout(() => {
        const score = Math.max(200 - moves * 2 - Math.floor(timeElapsed / 5), 50);
        const accuracy = Math.round((matches * 2 / moves) * 100);

        navigate('/player/game-result', {
          state: {
            game,
            mode,
            sessionData: {
              scoreFinal: score,
              accuracy: Math.min(accuracy, 100),
              duration: formatTime(timeElapsed),
              reussite: accuracy >= 70,
              moves,
              matches,
            },
          },
        });
      }, 1000);
    }
  }, [matches, totalPairs]);

  const handleCardClick = (cardId: number) => {
    if (!gameStarted) setGameStarted(true);
    
    const card = cards[cardId];
    if (card.matched || card.flipped || flippedCards.length === 2) return;

    const newCards = [...cards];
    newCards[cardId].flipped = true;
    setCards(newCards);

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      setMoves(moves + 1);
      const [firstId, secondId] = newFlippedCards;
      
      if (cards[firstId].pairKey === cards[secondId].pairKey) {
        // Match found
        setTimeout(() => {
          const matchedCards = [...cards];
          matchedCards[firstId].matched = true;
          matchedCards[secondId].matched = true;
          setCards(matchedCards);
          setMatches(matches + 1);
          setFlippedCards([]);
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          const resetCards = [...cards];
          resetCards[firstId].flipped = false;
          resetCards[secondId].flipped = false;
          setCards(resetCards);
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  if (window.confirm('Are you sure you want to quit?')) {
                    navigate('/player/dashboard');
                  }
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </motion.button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{game?.title || 'Memory Game'}</h1>
                <p className="text-sm text-gray-600">Match all pairs</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={initializeGame}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="font-medium">Restart</span>
              </motion.button>
            </div>
          </div>
          <div className="flex items-center gap-6 mt-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
              <span className="font-bold text-blue-600">{formatTime(timeElapsed)}</span>
            </div>
            <div className="px-4 py-2 bg-purple-50 rounded-lg">
              <span className="font-bold text-purple-600">Moves: {moves}</span>
            </div>
            <div className="px-4 py-2 bg-green-50 rounded-lg">
              <span className="font-bold text-green-600">
                Matches: {matches} / {totalPairs}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Game Board */}
        <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto">
          {cards.map((card) => (
            <motion.div
              key={card.id}
              whileHover={!card.matched && !card.flipped ? { scale: 1.05 } : {}}
              whileTap={!card.matched && !card.flipped ? { scale: 0.95 } : {}}
              onClick={() => handleCardClick(card.id)}
              className={`aspect-square rounded-2xl cursor-pointer relative ${
                card.matched ? 'opacity-70' : ''
              }`}
              style={{ perspective: 1000 }}
            >
              <motion.div
                className="w-full h-full"
                animate={{ rotateY: card.flipped || card.matched ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Card Back */}
                <div
                  className={`absolute inset-0 rounded-2xl flex items-center justify-center ${
                    card.matched
                      ? 'bg-gradient-to-br from-green-400 to-emerald-500'
                      : 'bg-gradient-to-br from-purple-500 to-blue-500'
                  } shadow-lg`}
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(0deg)',
                  }}
                >
                  <span className="text-white text-4xl">?</span>
                </div>
                {/* Card Front */}
                <div
                  className="absolute inset-0 bg-white rounded-2xl flex items-center justify-center shadow-lg"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  <span className="text-6xl">{card.emoji}</span>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Instructions */}
        {!gameStarted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 bg-white rounded-2xl p-6 text-center max-w-2xl mx-auto shadow-lg"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-2">How to Play</h3>
            <p className="text-gray-600">
              Click on cards to flip them. Find all matching pairs in the least moves and fastest time!
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
