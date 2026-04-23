import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useLocation, useParams } from 'react-router';
import { ArrowLeft, Clock, CheckCircle, XCircle, Lightbulb } from 'lucide-react';
import userApi from '@/api/user/user.api';
import PlayerHeaderActions from '@/components/player/PlayerHeaderActions';
import { exitFullscreenSafely } from '@/utils/fullscreen';
import type { QuizQuestionDTO } from '@/api/types';

export default function QuizGame() {
  const navigate = useNavigate();
  const location = useLocation();
  const { gameId } = useParams();
  const { game, mode, roomCode, teamName } = location.state || {};
  const [quizRows, setQuizRows] = useState<QuizQuestionDTO[]>([]);

  const questions = useMemo(() => {
    const byGame = quizRows.map((q) => {
      const options = Array.isArray(q.options) && q.options.length > 0 ? q.options : [q.bonneReponse];
      let correctAnswer = options.findIndex((opt) => opt?.trim().toLowerCase() === (q.bonneReponse ?? '').trim().toLowerCase());
      if (correctAnswer < 0) {
        options.push(q.bonneReponse);
        correctAnswer = options.length - 1;
      }
      return {
        id: q.id,
        question: q.contenu,
        options,
        correctAnswer,
        explanation: q.explication || '',
        points: 10,
      };
    });
    return byGame;
  }, [quizRows]);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(180);
  const [answeredQuestions, setAnsweredQuestions] = useState<boolean[]>(() => new Array(questions.length).fill(false));
  const sessionStartMsRef = useRef<number>(Date.now());
  const isFinishingRef = useRef(false);
  const configuredDurationMinutes = useMemo(() => {
    const fromGameField = Number(game?.durationMinutes);
    if (Number.isFinite(fromGameField) && fromGameField > 0) return fromGameField;
    const estimated = String(game?.estimatedTime ?? '').toLowerCase();
    const match = estimated.match(/(\d+)/);
    if (match) {
      const parsed = Number(match[1]);
      if (Number.isFinite(parsed) && parsed > 0) return parsed;
    }
    return 10;
  }, [game]);
  const configuredDurationSeconds = configuredDurationMinutes * 60;

  const totalQuestions = questions.length;
  const question = questions[currentQuestion];
  const isLastQuestion = currentQuestion === totalQuestions - 1;

  useEffect(() => {
    if (!gameId) return;
    let cancelled = false;
    userApi.getQuizQuestionsByGame(gameId)
      .then((res) => {
        if (cancelled) return;
        setQuizRows(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => {
        if (!cancelled) setQuizRows([]);
      });
    return () => { cancelled = true; };
  }, [gameId]);

  useEffect(() => {
    setAnsweredQuestions(new Array(questions.length).fill(false));
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setCorrectAnswersCount(0);
    setTimeLeft(configuredDurationSeconds);
    sessionStartMsRef.current = Date.now();
    isFinishingRef.current = false;
  }, [gameId, questions.length, configuredDurationSeconds]);

  // Timer
  useEffect(() => {
    if (timeLeft > 0 && !showExplanation) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      void handleFinishGame();
    }
  }, [timeLeft, showExplanation]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (showExplanation) return;
    setSelectedAnswer(answerIndex);
  };

  const handleVerifyAnswer = () => {
    if (selectedAnswer === null) return;
    
    setShowExplanation(true);
    
    const newAnsweredQuestions = [...answeredQuestions];
    newAnsweredQuestions[currentQuestion] = true;
    setAnsweredQuestions(newAnsweredQuestions);

    if (selectedAnswer === question.correctAnswer) {
      setScore(score + question.points);
      setCorrectAnswersCount((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (isLastQuestion) {
      void handleFinishGame();
    } else {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  const handleFinishGame = async () => {
    if (isFinishingRef.current) return;
    isFinishingRef.current = true;
    const accuracy = totalQuestions > 0 ? (correctAnswersCount / totalQuestions) * 100 : 0;
    const durationSeconds = Math.max(1, Math.round((Date.now() - sessionStartMsRef.current) / 1000));
    await exitFullscreenSafely();
    navigate('/player/game-result', {
      state: {
        game,
        mode,
        roomCode,
            teamName,
        sessionData: {
          scoreFinal: score,
          accuracy: Math.round(accuracy),
          durationSeconds,
          reussite: score >= 80,
          totalQuestions,
          correctAnswers: correctAnswersCount,
        },
      },
    });
  };

  const timePercentage = configuredDurationSeconds > 0 ? (timeLeft / configuredDurationSeconds) * 100 : 0;
  const progressPercentage = totalQuestions > 0 ? ((currentQuestion + 1) / totalQuestions) * 100 : 0;

  const isCorrect = question ? selectedAnswer === question.correctAnswer : false;

  if (totalQuestions === 0) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="bg-white/5 rounded-2xl p-8 border border-white/15 backdrop-blur-xl max-w-md text-center">
          <p className="text-slate-200 mb-4">No questions for this game yet. The educator can add and associate questions to this game.</p>
          <button
            onClick={() => navigate('/player/dashboard')}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

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
                  if (window.confirm('Are you sure you want to quit? Your progress will be lost.')) {
                    navigate('/player/dashboard');
                  }
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-white" />
              </motion.button>
              <div>
                <h1 className="text-xl font-bold text-white">{game?.title || 'Quiz Game'}</h1>
                <p className="text-sm text-slate-300">
                  Question {currentQuestion + 1} of {totalQuestions}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="font-bold text-blue-600">{formatTime(timeLeft)}</span>
                </div>
                <div className="px-4 py-2 bg-purple-50 rounded-lg">
                  <span className="font-bold text-purple-600">Score: {score}</span>
                </div>
              </div>
              <PlayerHeaderActions />
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative h-2 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
            />
          </div>

          {/* Time Bar */}
          <div className="relative h-1 bg-white/20 rounded-full overflow-hidden mt-2">
            <motion.div
              animate={{ width: `${timePercentage}%` }}
              className={`absolute inset-y-0 left-0 rounded-full ${
                timeLeft < 30 ? 'bg-red-500' : timeLeft < 60 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
            />
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white/5 rounded-2xl p-8 border border-white/15 backdrop-blur-xl"
          >
            {/* Question */}
            <div className="mb-8">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
                  {currentQuestion + 1}
                </div>
                <h2 className="text-2xl font-bold text-white">{question.question}</h2>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full font-semibold">
                  {question.points} points
                </span>
              </div>
            </div>

            {/* Answer Options */}
            <div className="space-y-3 mb-6">
              {question.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrectAnswer = index === question.correctAnswer;
                const showCorrect = showExplanation && isCorrectAnswer;
                const showIncorrect = showExplanation && isSelected && !isCorrectAnswer;

                return (
                  <motion.button
                    key={index}
                    whileHover={!showExplanation ? { scale: 1.02, x: 5 } : {}}
                    whileTap={!showExplanation ? { scale: 0.98 } : {}}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={showExplanation}
                    className={`w-full p-4 rounded-xl border-2 text-left font-medium transition-all ${
                      showCorrect
                        ? 'bg-green-50 border-green-500 text-green-900'
                        : showIncorrect
                        ? 'bg-red-50 border-red-500 text-red-900'
                        : isSelected
                        ? 'bg-purple-50 border-purple-500 text-purple-900'
                        : 'bg-white/5 border-white/20 text-slate-100 hover:border-fuchsia-300 hover:bg-white/10'
                    } ${showExplanation ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option}</span>
                      {showCorrect && <CheckCircle className="w-6 h-6 text-green-600" />}
                      {showIncorrect && <XCircle className="w-6 h-6 text-red-600" />}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Explanation */}
            <AnimatePresence>
              {showExplanation && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`p-6 rounded-xl mb-6 ${
                    isCorrect ? 'bg-green-50 border-2 border-green-300' : 'bg-red-50 border-2 border-red-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {isCorrect ? (
                      <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                    )}
                    <div>
                      <h3 className={`font-bold mb-2 ${isCorrect ? 'text-green-900' : 'text-red-900'}`}>
                        {isCorrect ? '🎉 Correct!' : '❌ Incorrect'}
                      </h3>
                      <div className="flex items-start gap-2">
                        <Lightbulb className="w-5 h-5 text-slate-300 flex-shrink-0 mt-0.5" />
                        <p className="text-slate-200">{question.explanation}</p>
                      </div>
                      {isCorrect && (
                        <p className="mt-2 font-semibold text-green-700">+{question.points} points</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons */}
            <div className="flex gap-4">
              {!showExplanation ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleVerifyAnswer}
                  disabled={selectedAnswer === null}
                  className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all ${
                    selectedAnswer === null
                      ? 'bg-white/15 text-slate-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-lg'
                  }`}
                >
                  Verify Answer
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleNextQuestion}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-shadow"
                >
                  {isLastQuestion ? 'Finish Quiz' : 'Next Question'}
                </motion.button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
