import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Target, Flag, TrendingUp } from 'lucide-react';

const QuickActions = ({ actions = [] }) => {
  const defaultActions = [
    {
      id: 1,
      title: 'Add Transaction',
      description: 'Record a new transaction',
      icon: Plus,
      action: 'add-transaction',
      color: 'blue'
    },
    {
      id: 2,
      title: 'Set Budget',
      description: 'Create a new budget',
      icon: Target,
      action: 'set-budget',
      color: 'green'
    },
    {
      id: 3,
      title: 'Add Goal',
      description: 'Create a financial goal',
      icon: Flag,
      action: 'add-goal',
      color: 'purple'
    },
    {
      id: 4,
      title: 'Investment',
      description: 'Add investment',
      icon: TrendingUp,
      action: 'add-investment',
      color: 'orange'
    }
  ];

  const displayActions = actions.length > 0 ? actions : defaultActions;

  const getColorClasses = (color) => {
    const colorMap = {
      blue: {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-200 dark:border-blue-800',
        text: 'text-blue-600 dark:text-blue-400',
        icon: 'text-blue-500',
        hover: 'hover:bg-blue-100 dark:hover:bg-blue-900/40'
      },
      green: {
        bg: 'bg-green-50 dark:bg-green-900/20',
        border: 'border-green-200 dark:border-green-800',
        text: 'text-green-600 dark:text-green-400',
        icon: 'text-green-500',
        hover: 'hover:bg-green-100 dark:hover:bg-green-900/40'
      },
      purple: {
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        border: 'border-purple-200 dark:border-purple-800',
        text: 'text-purple-600 dark:text-purple-400',
        icon: 'text-purple-500',
        hover: 'hover:bg-purple-100 dark:hover:bg-purple-900/40'
      },
      orange: {
        bg: 'bg-orange-50 dark:bg-orange-900/20',
        border: 'border-orange-200 dark:border-orange-800',
        text: 'text-orange-600 dark:text-orange-400',
        icon: 'text-orange-500',
        hover: 'hover:bg-orange-100 dark:hover:bg-orange-900/40'
      }
    };

    return colorMap[color] || colorMap.blue;
  };

  const handleAction = (action) => {
    // Handle different actions
    switch (action) {
      case 'add-transaction':
        // Navigate to transactions page or open modal
        console.log('Add transaction action');
        break;
      case 'set-budget':
        // Navigate to budget page or open modal
        console.log('Set budget action');
        break;
      case 'add-goal':
        // Navigate to goals page or open modal
        console.log('Add goal action');
        break;
      case 'add-investment':
        // Navigate to investments page or open modal
        console.log('Add investment action');
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Quick Actions
      </h3>

      <div className="grid grid-cols-2 gap-4">
        {displayActions.map((action, index) => {
          const colors = getColorClasses(action.color);
          const IconComponent = action.icon;

          return (
            <motion.button
              key={action.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleAction(action.action)}
              className={`p-4 rounded-lg border ${colors.bg} ${colors.border} ${colors.hover} transition-all duration-200 text-left`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${colors.bg}`}>
                  <IconComponent className={`w-5 h-5 ${colors.icon}`} />
                </div>
                <div>
                  <p className={`font-medium ${colors.text}`}>
                    {action.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {action.description}
                  </p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions; 