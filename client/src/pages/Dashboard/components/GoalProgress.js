import React from 'react';
import { motion } from 'framer-motion';
import { Target, Calendar } from 'lucide-react';
import { formatCurrency, formatPercentage } from '../../../utils/formatters';

const GoalProgress = ({ goals = [] }) => {
  const defaultGoals = [
    {
      id: 1,
      name: 'Emergency Fund',
      currentAmount: 8000,
      targetAmount: 10000,
      progress: 80,
      targetDate: '2024-06-01'
    },
    {
      id: 2,
      name: 'Vacation Fund',
      currentAmount: 2500,
      targetAmount: 5000,
      progress: 50,
      targetDate: '2024-08-15'
    },
    {
      id: 3,
      name: 'Home Down Payment',
      currentAmount: 15000,
      targetAmount: 50000,
      progress: 30,
      targetDate: '2025-12-01'
    }
  ];

  const displayGoals = goals.length > 0 ? goals : defaultGoals;

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-blue-500';
    if (progress >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <Target className="w-6 h-6 text-purple-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Goal Progress
        </h3>
      </div>

      <div className="space-y-4">
        {displayGoals.map((goal, index) => (
          <motion.div
            key={goal.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900 dark:text-white">
                {goal.name}
              </h4>
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                {formatPercentage(goal.progress / 100)}
              </span>
            </div>

            <div className="mb-2">
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${goal.progress}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className={`h-2 rounded-full ${getProgressColor(goal.progress)}`}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <span className="text-gray-600 dark:text-gray-400">
                  {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                </span>
                <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(goal.targetDate).toLocaleDateString()}</span>
                </div>
              </div>
              <span className="text-gray-500 dark:text-gray-400">
                {formatCurrency(goal.targetAmount - goal.currentAmount)} remaining
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default GoalProgress; 