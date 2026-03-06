import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate, useLocation, useParams } from 'react-router';
import { ArrowLeft, Clock, Lightbulb, CheckCircle, XCircle } from 'lucide-react';

interface Puzzle {
  id: number;
  question: string;
  pattern: number[];
  answer: number;
  hint: string;
}

const puzzles: Puzzle[] = [
  {
    id: 1,
    question: 'What number comes next in the pattern?',
    pattern: [2, 4, 8, 16, 32],
    answer: 64,
    hint: 'Each number is double the previous one',
  },
  {
    id: 2,
    question: 'Complete the sequence:',
    pattern: [1, 4, 9, 16, 25],
    answer: 36,
    hint: 'These are perfect squares: 1², 2², 3²...',
  },
  {
    id: 3,
    question: 'What number completes the pattern?',
    pattern: [5, 10, 20, 40, 80],
    answer: 160,
    hint: 'Each number is multiplied by 2',
  },
  {
    id: 4,
    question: 'Find the missing number:',
    pattern: [3, 6, 12, 24, 48],
    answer: 96,
    hint: 'Pattern: multiply by 2',
  },
  {
    id: 5,
    question: 'What comes next?',
    pattern: [100, 50, 25, 12.5, 6.25],
    answer: 3.125,
    hint: 'Each number is half of the previous',
  },
];

export default function LogicGame() {
  const navigate = useNavigate();
  const location = useLocation();
  const { gameId } = useParams();
  const { game, mode } = location.state || {};

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
    const correct = parseFloat(userAnswer) === puzzle.answer;
    setIsCorrect(correct);
    setShowFeedback(true);

    if (correct) {
      const points = showHint ? 15 : 25;
      setScore(score + points);
    }
  };

  const handleNext = () => {
    if (isLastPuzzle) {
      const accuracy = Math.round((score / (totalPuzzles * 25)) * 100);
      
      navigate('/player/game-result', {
        state: {
          game,
          mode,
          sessionData: {
            scoreFinal: score,
            accuracy,
            duration: formatTime(timeElapsed),
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
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
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </motion.button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{game?.title || 'Logic Game'}</h1>
                <p className="text-sm text-gray-600">
                  Puzzle {currentPuzzle + 1} of {totalPuzzles}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="font-bold text-blue-600">{formatTime(timeElapsed)}</span>
              </div>
              <div className="px-4 py-2 bg-purple-50 rounded-lg">
                <span className="font-bold text-purple-600">Score: {score}</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
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
          className="bg-white rounded-2xl p-8 shadow-lg"
        >
          {/* Question */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{puzzle.question}</h2>

            {/* Pattern Display */}
            <div className="flex items-center justify-center gap-4 mb-8">
              {puzzle.pattern.map((num, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg"
                >
                  {num}
                </motion.div>
              ))}
              <div className="w-16 h-16 bg-gray-100 border-2 border-dashed border-gray-400 rounded-xl flex items-center justify-center text-gray-400 font-bold text-xl">
                ?
              </div>
            </div>
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
              className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-xl"
            >
              <div className="flex items-start gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-yellow-900">{puzzle.hint}</p>
              </div>
            </motion.div>
          )}

          {/* Answer Input */}
          {!showFeedback && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Answer</label>
              <input
                type="number"
                step="any"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                className="w-full px-6 py-4 rounded-xl border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-2xl font-bold text-center"
                placeholder="Enter the missing number"
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
                  <p className="text-gray-700">
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
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
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
