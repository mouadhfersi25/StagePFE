import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useLocation, useParams } from 'react-router';
import { ArrowLeft, Clock, CheckCircle, XCircle, Lightbulb } from 'lucide-react';
import { useAdminData } from '@/context';

export default function QuizGame() {
  const navigate = useNavigate();
  const location = useLocation();
  const { gameId } = useParams();
  const { game, mode } = location.state || {};
  const { educatorQuestions } = useAdminData();

  const questions = useMemo(() => {
    const byGame = educatorQuestions
      .filter((q) => q.gameId === gameId)
      .map((q) => ({
        id: q.id,
        question: q.content,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: '',
        points: 10,
      }));
    return byGame;
  }, [educatorQuestions, gameId]);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(180);
  const [answeredQuestions, setAnsweredQuestions] = useState<boolean[]>(() => new Array(questions.length).fill(false));

  const totalQuestions = questions.length;
  const question = questions[currentQuestion];
  const isLastQuestion = currentQuestion === totalQuestions - 1;

  useEffect(() => {
    setAnsweredQuestions(new Array(questions.length).fill(false));
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
  }, [gameId]);

  // Timer
  useEffect(() => {
    if (timeLeft > 0 && !showExplanation) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      handleFinishGame();
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
    }
  };

  const handleNextQuestion = () => {
    if (isLastQuestion) {
      handleFinishGame();
    } else {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  const handleFinishGame = () => {
    const accuracy = (answeredQuestions.filter(Boolean).length / totalQuestions) * 100;
    const duration = `${Math.floor((180 - timeLeft) / 60)} min`;
    
    navigate('/player/game-result', {
      state: {
        game,
        mode,
        sessionData: {
          scoreFinal: score,
          accuracy: Math.round(accuracy),
          duration,
          reussite: score >= 80,
          totalQuestions,
          correctAnswers: answeredQuestions.filter(Boolean).length,
        },
      },
    });
  };

  const timePercentage = (timeLeft / 180) * 100;
  const progressPercentage = totalQuestions > 0 ? ((currentQuestion + 1) / totalQuestions) * 100 : 0;

  const isCorrect = question ? selectedAnswer === question.correctAnswer : false;

  if (totalQuestions === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md text-center">
          <p className="text-gray-700 mb-4">No questions for this game yet. The educator can add and associate questions to this game.</p>
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
                  if (window.confirm('Are you sure you want to quit? Your progress will be lost.')) {
                    navigate('/player/dashboard');
                  }
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-700" />
              </motion.button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{game?.title || 'Quiz Game'}</h1>
                <p className="text-sm text-gray-600">
                  Question {currentQuestion + 1} of {totalQuestions}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="font-bold text-blue-600">{formatTime(timeLeft)}</span>
              </div>
              <div className="px-4 py-2 bg-purple-50 rounded-lg">
                <span className="font-bold text-purple-600">Score: {score}</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
            />
          </div>

          {/* Time Bar */}
          <div className="relative h-1 bg-gray-200 rounded-full overflow-hidden mt-2">
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
            className="bg-white rounded-2xl p-8 shadow-lg"
          >
            {/* Question */}
            <div className="mb-8">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
                  {currentQuestion + 1}
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{question.question}</h2>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
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
                        : 'bg-white border-gray-300 text-gray-900 hover:border-purple-300 hover:bg-purple-50'
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
                        <Lightbulb className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                        <p className="text-gray-700">{question.explanation}</p>
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
                      ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
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
