import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, X, CheckCircle } from 'lucide-react';

const InterventionAlert = ({ intervention, onDismiss }) => {
  if (!intervention) return null;

  const getAlertColor = (type) => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800';
      case 'error':
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
      case 'success':
        return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
      default:
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case 'warning':
        return 'text-yellow-500';
      case 'error':
        return 'text-red-500';
      case 'success':
        return 'text-green-500';
      default:
        return 'text-blue-500';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`p-4 rounded-lg border ${getAlertColor(intervention.type)}`}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className={`w-5 h-5 ${getIconColor(intervention.type)} mt-0.5`} />
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 dark:text-white mb-1">
            {intervention.title}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
            {intervention.message}
          </p>
          {intervention.action && (
            <button className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
              {intervention.action}
            </button>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default InterventionAlert; 