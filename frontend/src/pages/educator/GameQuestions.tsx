import { motion } from 'motion/react';
import { ArrowLeft, Plus, Edit, Trash2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import EducatorSidebar from '@/components/educator/EducatorSidebar';
import { useAdminData } from '@/context';

export default function GameQuestions() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { games, educatorQuestions, setEducatorQuestions } = useAdminData();
  const game = games.find((g) => g.id === gameId);
  const questionsForGame = educatorQuestions.filter((q) => q.gameId === gameId);

  const handleDelete = (questionId: string) => {
    if (confirm('Are you sure you want to delete this question?')) {
      setEducatorQuestions((prev) => prev.filter((q) => q.id !== questionId));
      toast.success('Question deleted');
    }
  };

  if (!game || game.type !== 'quiz') {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <EducatorSidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-600">Game not found.</p>
          <button onClick={() => navigate('/educator/games')} className="ml-4 text-green-600 hover:underline">Back to Games</button>
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
            <h1 className="text-3xl font-bold text-gray-900">Manage questions</h1>
            <p className="text-gray-600 mt-1">
              <span className="font-medium text-gray-800">{game.title}</span> — add, edit or delete questions for this quiz.
            </p>
          </div>

          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">
              <span className="font-semibold text-gray-900">{questionsForGame.length}</span> question{questionsForGame.length !== 1 ? 's' : ''} for this game
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/educator/questions/add', { state: { gameId: game.id } })}
              className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg hover:shadow-lg font-medium"
            >
              <Plus className="w-5 h-5" />
              Add question
            </motion.button>
          </div>

          {questionsForGame.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-12 border border-gray-100 text-center"
            >
              <p className="text-gray-600 mb-6">No questions yet for this game. Add the first one to configure the quiz.</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/educator/questions/add', { state: { gameId: game.id } })}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg font-medium"
              >
                <Plus className="w-5 h-5" />
                Add question
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Question</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Difficulty</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Created</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {questionsForGame.map((question) => (
                      <tr key={question.id} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="py-4 px-6">
                          <p className="font-medium text-gray-900">{question.content}</p>
                          <p className="text-xs text-gray-500 mt-1">{question.options?.length ?? 0} options</p>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              question.difficulty === 'Easy' ? 'bg-green-100 text-green-800' : question.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {question.difficulty}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-500">{question.createdDate}</td>
                        <td className="py-4 px-6">
                          <div className="flex gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => navigate(`/educator/questions/${question.id}/edit`)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleDelete(question.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
