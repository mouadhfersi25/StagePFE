import { useState } from 'react';
import { motion } from 'motion/react';
import { Check, X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import type { ModerationItem } from '@/data/types';

export default function Moderation() {
  const [items, setItems] = useState<ModerationItem[]>([]);

  const handleApprove = (itemId: string) => {
    setItems(items.map(item => 
      item.id === itemId ? { ...item, status: 'Approved' as const } : item
    ));
    toast.success('Content approved');
  };

  const handleReject = (itemId: string) => {
    setItems(items.map(item => 
      item.id === itemId ? { ...item, status: 'Rejected' as const } : item
    ));
    toast.success('Content rejected');
  };

  const pendingItems = items.filter(item => item.status === 'Pending');

  return (
    <div className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Content Moderation</h1>
            <p className="text-gray-600">Review and manage reported content</p>
          </div>

          {pendingItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">All Clear!</h3>
              <p className="text-gray-600">No pending items to review</p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded font-medium uppercase">
                          {item.type}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded font-medium ${
                          item.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                          item.status === 'Approved' ? 'bg-green-100 text-green-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2">Content: "{item.content}"</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Reason:</span> {item.reason}
                      </p>
                      <p className="text-xs text-gray-500">
                        Reported by {item.reportedBy} on {item.date}
                      </p>
                    </div>
                    {item.status === 'Pending' && (
                      <div className="flex gap-2 flex-shrink-0">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleApprove(item.id)}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                        >
                          <Check className="w-4 h-4" />
                          Approve
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleReject(item.id)}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          Reject
                        </motion.button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
    </div>
  );
}
