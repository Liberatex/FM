import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

// Utils
import { formatCurrency, formatPercentage } from '../../../utils/formatters';

const CategoryBudget = ({ category, onEdit, onDelete }) => {
  const isOverBudget = category.spent > category.budget;
  const isNearLimit = (category.spent / category.budget) >= 0.9;
  const progressPercentage = Math.min((category.spent / category.budget) * 100, 100);

  const getProgressColor = () => {
    if (isOverBudget) return 'bg-red-500';
    if (isNearLimit) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusIcon = () => {
    if (isOverBudget) {
      return <AlertTriangle className="w-4 h-4 text-red-500" />;
    } else if (isNearLimit) {
      return <Clock className="w-4 h-4 text-yellow-500" />;
    } else {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  const getStatusText = () => {
    if (isOverBudget) {
      return 'Over Budget';
    } else if (isNearLimit) {
      return 'Near Limit';
    } else {
      return 'On Track';
    }
  };

  const getStatusColor = () => {
    if (isOverBudget) {
      return 'text-red-600 dark:text-red-400';
    } else if (isNearLimit) {
      return 'text-yellow-600 dark:text-yellow-400';
    } else {
      return 'text-green-600 dark:text-green-400';
    }
  };

  const getStatusBgColor = () => {
    if (isOverBudget) {
      return 'bg-red-100 dark:bg-red-900/20';
    } else if (isNearLimit) {
      return 'bg-yellow-100 dark:bg-yellow-900/20';
    } else {
      return 'bg-green-100 dark:bg-green-900/20';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <h4 className="font-medium text-gray-900 dark:text-white">
              {category.name}
            </h4>
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBgColor()} ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(category)}
            className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(category.id)}
            className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Budget Details */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Budget</p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {formatCurrency(category.budget)}
          </p>
        </div>
        
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Spent</p>
          <p className={`text-sm font-medium ${
            isOverBudget 
              ? 'text-red-600 dark:text-red-400' 
              : 'text-gray-900 dark:text-white'
          }`}>
            {formatCurrency(category.spent)}
          </p>
        </div>
        
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Remaining</p>
          <p className={`text-sm font-medium ${
            category.remaining < 0 
              ? 'text-red-600 dark:text-red-400' 
              : 'text-gray-900 dark:text-white'
          }`}>
            {formatCurrency(category.remaining)}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Progress
          </span>
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
            {formatPercentage(progressPercentage)}
          </span>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Additional Info */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-1">
          {isOverBudget ? (
            <TrendingDown className="w-3 h-3" />
          ) : (
            <TrendingUp className="w-3 h-3" />
          )}
          <span>
            {isOverBudget 
              ? `${formatCurrency(Math.abs(category.remaining))} over budget`
              : `${formatPercentage(100 - progressPercentage)} remaining`
            }
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          <DollarSign className="w-3 h-3" />
          <span>
            {formatCurrency(category.spent)} of {formatCurrency(category.budget)}
          </span>
        </div>
      </div>

      {/* Warning Message */}
      {isOverBudget && (
        <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3 h-3 text-red-500" />
            <span className="text-xs text-red-700 dark:text-red-300">
              You've exceeded your budget by {formatPercentage(progressPercentage - 100)}
            </span>
          </div>
        </div>
      )}

      {isNearLimit && !isOverBudget && (
        <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3 text-yellow-500" />
            <span className="text-xs text-yellow-700 dark:text-yellow-300">
              You're close to your budget limit. Consider reducing spending in this category.
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default CategoryBudget; 