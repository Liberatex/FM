import React from 'react';
import { motion } from 'framer-motion';
import { Target, Calendar, DollarSign, TrendingUp, Award, Clock } from 'lucide-react';
import { formatCurrency, formatPercentage, formatDate } from '../../../utils/formatters';

const GoalProgress = ({ goal }) => {
  const progress = goal.currentAmount / goal.targetAmount;
  const remaining = goal.targetAmount - goal.currentAmount;
  const daysRemaining = Math.ceil((new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24));
  const isCompleted = progress >= 1;
  const isOverdue = daysRemaining < 0 && !isCompleted;
  const isNearDeadline = daysRemaining <= 30 && daysRemaining > 0;

  const getProgressColor = () => {
    if (isCompleted) return 'bg-green-500';
    if (progress >= 0.8) return 'bg-blue-500';
    if (progress >= 0.5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusIcon = () => {
    if (isCompleted) return <Award className="w-5 h-5 text-green-500" />;
    if (isOverdue) return <Clock className="w-5 h-5 text-red-500" />;
    if (isNearDeadline) return <Clock className="w-5 h-5 text-yellow-500" />;
    return <Target className="w-5 h-5 text-blue-500" />;
  };

  const getStatusText = () => {
    if (isCompleted) return 'Completed';
    if (isOverdue) return 'Overdue';
    if (isNearDeadline) return 'Near Deadline';
    return 'In Progress';
  };

  const getStatusColor = () => {
    if (isCompleted) return 'text-green-600 dark:text-green-400';
    if (isOverdue) return 'text-red-600 dark:text-red-400';
    if (isNearDeadline) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-blue-600 dark:text-blue-400';
  };

  const getStatusBgColor = () => {
    if (isCompleted) return 'bg-green-100 dark:bg-green-900/20';
    if (isOverdue) return 'bg-red-100 dark:bg-red-900/20';
    if (isNearDeadline) return 'bg-yellow-100 dark:bg-yellow-900/20';
    return 'bg-blue-100 dark:bg-blue-900/20';
  };

  const getPriorityColor = () => {
    switch (goal.priority) {
      case 'high':
        return 'text-red-600 dark:text-red-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'low':
        return 'text-green-600 dark:text-green-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getPriorityBgColor = () => {
    switch (goal.priority) {
      case 'high':
        return 'bg-red-100 dark:bg-red-900/20';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/20';
      case 'low':
        return 'bg-green-100 dark:bg-green-900/20';
      default:
        return 'bg-gray-100 dark:bg-gray-900/20';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {goal.name}
            </h3>
            {getStatusIcon()}
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBgColor()} ${getStatusColor()}`}>
              {getStatusText()}
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityBgColor()} ${getPriorityColor()}`}>
              {goal.priority} Priority
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Progress
          </span>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            {formatPercentage(progress)}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progress * 100, 100)}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`h-3 rounded-full ${getProgressColor()}`}
          />
        </div>
      </div>

      {/* Financial Details */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-gray-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Current</span>
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {formatCurrency(goal.currentAmount)}
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-gray-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Target</span>
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {formatCurrency(goal.targetAmount)}
          </p>
        </div>
      </div>

      {/* Remaining Amount */}
      {!isCompleted && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
              {remaining > 0 ? `${formatCurrency(remaining)} remaining` : 'Goal exceeded!'}
            </span>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Target: {formatDate(goal.targetDate)}
          </span>
        </div>
        <div className="text-right">
          {isOverdue ? (
            <span className="text-sm font-medium text-red-600 dark:text-red-400">
              {Math.abs(daysRemaining)} days overdue
            </span>
          ) : isCompleted ? (
            <span className="text-sm font-medium text-green-600 dark:text-green-400">
              Completed!
            </span>
          ) : (
            <span className={`text-sm font-medium ${
              isNearDeadline ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-600 dark:text-gray-400'
            }`}>
              {daysRemaining} days left
            </span>
          )}
        </div>
      </div>

      {/* Category */}
      {goal.category && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Category: {goal.category}
          </span>
        </div>
      )}

      {/* Description */}
      {goal.description && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {goal.description}
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default GoalProgress; 