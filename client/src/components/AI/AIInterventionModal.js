import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, CheckCircle, Info } from 'lucide-react';

const AIInterventionModal = ({ intervention, onClose, onAction }) => {
  if (!intervention) return null;

  const getIcon = () => {
    switch (intervention.type) {
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      default:
        return <Info className="w-6 h-6 text-blue-500" />;
    }
  };

  const getActionButton = () => {
    if (!intervention.actions || intervention.actions.length === 0) {
      return (
        <button
          onClick={onClose}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Got it
        </button>
      );
    }

    return (
      <div className="flex gap-2">
        {intervention.actions.map((action, index) => (
          <button
            key={index}
            onClick={() => onAction(intervention.id, action.type)}
            className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
              action.type === 'primary'
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {action.label}
          </button>
        ))}
      </div>
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {getIcon()}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {intervention.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  AI Recommendation
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-6">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {intervention.message}
            </p>
            
            {intervention.data && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Analysis Details
                </h4>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {intervention.data.analysis && (
                    <p className="mb-2">{intervention.data.analysis}</p>
                  )}
                  {intervention.data.recommendation && (
                    <p className="font-medium">{intervention.data.recommendation}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {getActionButton()}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AIInterventionModal;
