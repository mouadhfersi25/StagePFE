import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Save } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import EducatorSidebar from '@/components/educator/EducatorSidebar';
import { useAdminData } from '@/context';

export default function EditQuestion() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { games, educatorQuestions, setEducatorQuestions } = useAdminData();
  const question = educatorQuestions.find((q) => q.id === id);
  const quizGames = games.filter((g) => g.type === 'quiz');

  const [formData, setFormData] = useState({
    content: '',
    gameId: '',
    difficulty: 'Medium' as 'Easy' | 'Medium' | 'Hard',
    options: ['', '', '', ''],
    correctAnswer: 0,
  });

  useEffect(() => {
    if (!question) return;
    setFormData({
      content: question.content,
      gameId: question.gameId,
      difficulty: question.difficulty,
      options: question.options ?? ['', '', '', ''],
      correctAnswer: question.correctAnswer,
    });
  }, [id, question?.content, question?.gameId, question?.difficulty, question?.correctAnswer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setEducatorQuestions((prev) =>
      prev.map((q) =>
        q.id === id
          ? {
              ...q,
              content: formData.content,
              gameId: formData.gameId,
              gameName: quizGames.find((g) => g.id === formData.gameId)?.title ?? q.gameName,
              difficulty: formData.difficulty,
              options: formData.options,
              correctAnswer: formData.correctAnswer,
            }
          : q
      )
    );
    toast.success('Question updated successfully!');
    navigate('/educator/questions');
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  if (!question) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <EducatorSidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-600">Question not found.</p>
          <button onClick={() => navigate('/educator/questions')} className="ml-4 text-green-600 hover:underline">Back to Questions</button>
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
              onClick={() => navigate('/educator/questions')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Questions
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Edit Question</h1>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 max-w-3xl"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Text *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 min-h-[100px]"
                  placeholder="Enter your question here..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Game *
                  </label>
                  <select
                    value={formData.gameId}
                    onChange={(e) => setFormData({ ...formData, gameId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  >
                    <option value="">Choose a game...</option>
                    {quizGames.map((game) => (
                      <option key={game.id} value={game.id}>{game.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty *
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Answer Options *
                </label>
                <div className="space-y-3">
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={formData.correctAnswer === index}
                        onChange={() => setFormData({ ...formData, correctAnswer: index })}
                        className="w-4 h-4 text-green-600"
                      />
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder={`Option ${index + 1}`}
                        required
                      />
                      {formData.correctAnswer === index && (
                        <span className="text-xs text-green-600 font-medium">Correct Answer</span>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">Select the correct answer by clicking the radio button</p>
              </div>

              <div className="flex gap-3 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg hover:shadow-lg transition-shadow font-medium"
                >
                  <Save className="w-4 h-4" />
                  Update Question
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => navigate('/educator/questions')}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
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
