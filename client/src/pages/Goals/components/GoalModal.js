import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, Calendar, Target, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import { goalService } from '../../../services/goalService';
import { formatCurrency } from '../../../utils/formatters';

const GoalModal = ({ goal, isOpen, onClose, onSuccess }) => {
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: '',
      targetAmount: '',
      currentAmount: '',
      targetDate: '',
      category: '',
      description: '',
      priority: 'medium'
    }
  });

  const watchedAmount = watch('targetAmount');
  const watchedCategory = watch('category');

  useEffect(() => {
    if (goal) {
      reset({
        name: goal.name || '',
        targetAmount: goal.targetAmount || '',
        currentAmount: goal.currentAmount || '',
        targetDate: goal.targetDate || '',
        category: goal.category || '',
        description: goal.description || '',
        priority: goal.priority || 'medium'
      });
    } else {
      reset({
        name: '',
        targetAmount: '',
        currentAmount: '',
        targetDate: '',
        category: '',
        description: '',
        priority: 'medium'
      });
    }
  }, [goal, reset]);

  useEffect(() => {
    if (watchedAmount && watchedCategory) {
      const timer = setTimeout(() => {
        getAiSuggestions(watchedAmount, watchedCategory);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setAiSuggestions([]);
      setShowSuggestions(false);
    }
  }, [watchedAmount, watchedCategory]);

  const getAiSuggestions = async (amount, category) => {
    try {
      const suggestions = await goalService.getGoalRecommendations({
        targetAmount: parseFloat(amount),
        category
      });
      setAiSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } catch (error) {
      console.error('Failed to get AI suggestions:', error);
    }
  };

  const createGoalMutation = useMutation(
    (data) => goalService.createGoal(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('goals');
        toast.success('Goal created successfully!');
        onSuccess?.();
        onClose();
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to create goal');
      }
    }
  );

  const updateGoalMutation = useMutation(
    ({ id, data }) => goalService.updateGoal(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('goals');
        toast.success('Goal updated successfully!');
        onSuccess?.();
        onClose();
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to update goal');
      }
    }
  );

  const onSubmit = (data) => {
    setIsLoading(true);
    
    const goalData = {
      ...data,
      targetAmount: parseFloat(data.targetAmount),
      currentAmount: parseFloat(data.currentAmount) || 0
    };

    if (goal) {
      updateGoalMutation.mutate({ id: goal.id, data: goalData });
    } else {
      createGoalMutation.mutate(goalData);
    }
  };

  const applySuggestion = (suggestion) => {
    if (suggestion.targetAmount) setValue('targetAmount', suggestion.targetAmount);
    if (suggestion.category) setValue('category', suggestion.category);
    if (suggestion.description) setValue('description', suggestion.description);
    if (suggestion.priority) setValue('priority', suggestion.priority);
    setShowSuggestions(false);
  };

  const categories = [
    'Emergency Fund', 'Vacation', 'Home Purchase', 'Car Purchase',
    'Education', 'Retirement', 'Wedding', 'Business',
    'Investment', 'Debt Payoff', 'Home Renovation', 'Other'
  ];

  const priorities = [
    { value: 'low', label: 'Low Priority', color: 'text-green-600' },
    { value: 'medium', label: 'Medium Priority', color: 'text-yellow-600' },
    { value: 'high', label: 'High Priority', color: 'text-red-600' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={onClose}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {goal ? 'Edit Goal' : 'Create New Goal'}
                </h3>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Goal Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Goal Name *
                  </label>
                  <input
                    type="text"
                    {...register('name', { required: 'Goal name is required' })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., Emergency Fund"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                {/* Target Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Target Amount *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      step="0.01"
                      {...register('targetAmount', { 
                        required: 'Target amount is required',
                        min: { value: 0.01, message: 'Amount must be greater than 0' }
                      })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="0.00"
                    />
                  </div>
                  {errors.targetAmount && (
                    <p className="mt-1 text-sm text-red-600">{errors.targetAmount.message}</p>
                  )}
                </div>

                {/* Current Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Current Amount
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      step="0.01"
                      {...register('currentAmount', { 
                        min: { value: 0, message: 'Amount cannot be negative' }
                      })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="0.00"
                    />
                  </div>
                  {errors.currentAmount && (
                    <p className="mt-1 text-sm text-red-600">{errors.currentAmount.message}</p>
                  )}
                </div>

                {/* Target Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Target Date *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      {...register('targetDate', { required: 'Target date is required' })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  {errors.targetDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.targetDate.message}</p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category *
                  </label>
                  <select
                    {...register('category', { required: 'Category is required' })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                  )}
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Priority
                  </label>
                  <select
                    {...register('priority')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    {priorities.map((priority) => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Describe your goal..."
                  />
                </div>

                {/* AI Suggestions */}
                {showSuggestions && aiSuggestions.length > 0 && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="w-4 h-4 text-blue-500" />
                      <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        AI Suggestions
                      </h4>
                    </div>
                    <div className="space-y-2">
                      {aiSuggestions.slice(0, 3).map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => applySuggestion(suggestion)}
                          className="w-full p-2 text-left text-sm bg-white dark:bg-gray-700 rounded border border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        >
                          <div className="font-medium text-gray-900 dark:text-white">
                            {suggestion.title}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            {suggestion.description}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        {goal ? 'Updating...' : 'Creating...'}
                      </div>
                    ) : (
                      goal ? 'Update Goal' : 'Create Goal'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default GoalModal; 