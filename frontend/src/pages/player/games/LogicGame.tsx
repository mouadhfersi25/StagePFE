import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate, useLocation, useParams } from 'react-router';
import { ArrowLeft, Clock, Lightbulb, CheckCircle, XCircle } from 'lucide-react';
import userApi from '@/api/user/user.api';
import PlayerHeaderActions from '@/components/player/PlayerHeaderActions';
import { exitFullscreenSafely } from '@/utils/fullscreen';
import type { LogicPuzzleDTO } from '@/api/types';

interface Puzzle {
  id: number;
  question: string;
  type: 'SUITE_LOGIQUE' | 'INTRUS' | 'DEDUCTION';
  pattern: Array<string | number>;
  options: string[];
  answer: string;
  hint: string;
}

const defaultPuzzles: Puzzle[] = [
  {
    id: 1,
    question: 'What number comes next in the pattern?',
    type: 'SUITE_LOGIQUE',
    pattern: [2, 4, 8, 16, 32],
    options: [],
    answer: '64',
    hint: 'Each number is double the previous one',
  },
  {
    id: 2,
    question: 'Complete the sequence:',
    type: 'SUITE_LOGIQUE',
    pattern: [1, 4, 9, 16, 25],
    options: [],
    answer: '36',
    hint: 'These are perfect squares: 1², 2², 3²...',
  },
];

export default function LogicGame() {
  const navigate = useNavigate();
  const location = useLocation();
  const { gameId } = useParams();
  const { game, mode, roomCode, teamName } = location.state || {};
  const [puzzles, setPuzzles] = useState<Puzzle[]>(defaultPuzzles);

  const [currentPuzzle, setCurrentPuzzle] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [attempts, setAttempts] = useState(0);

  const puzzle = puzzles[currentPuzzle];
  const totalPuzzles = puzzles.length;
  const isLastPuzzle = currentPuzzle === totalPuzzles - 1;

  useEffect(() => {
    if (!gameId) return;
    let cancelled = false;
    userApi.getLogicPuzzlesByGame(gameId)
      .then((res) => {
        if (cancelled) return;
        const rows = Array.isArray(res.data) ? res.data : [];
        if (rows.length === 0) {
          setPuzzles(defaultPuzzles);
          return;
        }
        const mapped: Puzzle[] = rows.map((r: LogicPuzzleDTO) => {
          let data: { type?: string; sequence?: Array<string | number>; options?: string[] } = {};
          try {
            data = r.donnees ? JSON.parse(r.donnees) : {};
          } catch {
            data = {};
          }
          const type = ((r.sousType as Puzzle['type']) || (data.type as Puzzle['type']) || 'DEDUCTION');
          return {
            id: r.id,
            question: r.enonce,
            type,
            pattern: Array.isArray(data.sequence) ? data.sequence : [],
            options: Array.isArray(data.options) ? data.options : [],
            answer: String(r.bonneReponse ?? ''),
            hint: r.indice ?? '',
          };
        });
        setPuzzles(mapped);
        setCurrentPuzzle(0);
        setUserAnswer('');
        setShowFeedback(false);
        setShowHint(false);
        setScore(0);
        setHintsUsed(0);
        setAttempts(0);
        setTimeElapsed(0);
      })
      .catch(() => {
        if (!cancelled) setPuzzles(defaultPuzzles);
      });
    return () => { cancelled = true; };
  }, [gameId]);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => setTimeElapsed((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = () => {
    if (!userAnswer) return;
    
    setAttempts(attempts + 1);
    const correct = userAnswer.trim().toLowerCase() === puzzle.answer.trim().toLowerCase();
    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      const points = showHint ? 15 : 25;
      setScore(score + points);
    }
  };

  const handleNext = async () => {
    if (isLastPuzzle) {
      const accuracy = Math.round((score / (totalPuzzles * 25)) * 100);
      await exitFullscreenSafely();
      navigate('/player/game-result', {
        state: {
          game,
          mode,
          roomCode,
            teamName,
          sessionData: {
            scoreFinal: score,
            accuracy,
            durationSeconds: Math.max(1, timeElapsed),
            reussite: accuracy >= 60,
            attempts,
            hintsUsed,
          },
        },
      });
    } else {
      setCurrentPuzzle(currentPuzzle + 1);
      setUserAnswer('');
      setShowFeedback(false);
      setShowHint(false);
    }
  };

  const handleShowHint = () => {
    setShowHint(true);
    setHintsUsed(hintsUsed + 1);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="bg-slate-950/75 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  if (window.confirm('Are you sure you want to quit?')) {
                    navigate('/player/dashboard');
                  }
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-white" />
              </motion.button>
              <div>
              <h1 className="text-xl font-bold text-white">{game?.title || 'Logic Game'}</h1>
                <p className="text-sm text-slate-300">
                  Puzzle {currentPuzzle + 1} of {totalPuzzles}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg border border-white/20">
                  <Clock className="w-5 h-5 text-cyan-300" />
                  <span className="font-bold text-cyan-300">{formatTime(timeElapsed)}</span>
                </div>
                <div className="px-4 py-2 bg-white/10 rounded-lg border border-white/20">
                  <span className="font-bold text-fuchsia-300">Score: {score}</span>
                </div>
              </div>
              <PlayerHeaderActions />
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative h-2 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${((currentPuzzle + 1) / totalPuzzles) * 100}%` }}
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
            />
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          key={currentPuzzle}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/5 rounded-2xl p-8 border border-white/15 backdrop-blur-xl"
        >
          {/* Question */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">{puzzle.question}</h2>

            {puzzle.type === 'SUITE_LOGIQUE' && (
              <div className="flex items-center justify-center gap-4 mb-8 flex-wrap">
                {puzzle.pattern.map((num, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.06 }}
                    className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg"
                  >
                    {num}
                  </motion.div>
                ))}
                <div className="w-16 h-16 bg-white/10 border-2 border-dashed border-white/30 rounded-xl flex items-center justify-center text-slate-200 font-bold text-xl">
                  ?
                </div>
              </div>
            )}

            {(puzzle.type === 'INTRUS' || puzzle.type === 'DEDUCTION') && puzzle.options.length > 0 && (
              <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-3">
                {puzzle.options.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => !showFeedback && setUserAnswer(opt)}
                    className={`rounded-xl border-2 px-4 py-3 text-left transition-colors ${
                      userAnswer === opt ? 'border-fuchsia-400 bg-fuchsia-500/20 text-white' : 'border-white/20 bg-white/5 text-slate-100'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Hint Section */}
          {!showFeedback && !showHint && (
            <div className="mb-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleShowHint}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors border border-yellow-300"
              >
                <Lightbulb className="w-5 h-5" />
                <span className="font-medium">Need a hint? (-10 points)</span>
              </motion.button>
            </div>
          )}

          {showHint && !showFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-yellow-500/20 border-2 border-yellow-300/50 rounded-xl"
            >
              <div className="flex items-start gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-yellow-100">{puzzle.hint}</p>
              </div>
            </motion.div>
          )}

          {/* Answer Input */}
          {!showFeedback && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">Your Answer</label>
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                className="w-full px-6 py-4 rounded-xl border-2 border-white/20 bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-400 text-2xl font-bold text-center"
                placeholder={puzzle.type === 'SUITE_LOGIQUE' ? 'Entrez la suite' : 'Entrez la réponse'}
                autoFocus
              />
            </div>
          )}

          {/* Feedback */}
          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-xl mb-6 ${
                isCorrect
                  ? 'bg-green-50 border-2 border-green-300'
                  : 'bg-red-50 border-2 border-red-300'
              }`}
            >
              <div className="flex items-start gap-3">
                {isCorrect ? (
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                )}
                <div>
                  <h3 className={`font-bold mb-2 ${isCorrect ? 'text-green-900' : 'text-red-900'}`}>
                    {isCorrect ? '🎉 Excellent!' : '❌ Not quite right'}
                  </h3>
                  <p className="text-slate-200">
                    {isCorrect
                      ? `The answer is ${puzzle.answer}. ${puzzle.hint}`
                      : `The correct answer is ${puzzle.answer}. ${puzzle.hint}`}
                  </p>
                  {isCorrect && (
                    <p className="mt-2 font-semibold text-green-700">
                      +{showHint ? 15 : 25} points
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            {!showFeedback ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                disabled={!userAnswer}
                className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all ${
                  !userAnswer
                    ? 'bg-white/15 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg'
                }`}
              >
                Submit Answer
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNext}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-shadow"
              >
                {isLastPuzzle ? 'Finish' : 'Next Puzzle'}
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
