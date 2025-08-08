import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, Calendar, Tag, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';

// Services
import { budgetService } from '../../../services/budgetService';

// Utils
import { formatCurrency } from '../../../utils/formatters';

const BudgetModal = ({ budget, isOpen, onClose, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm({
    defaultValues: {
      name: '',
      amount: '',
      category: '',
      period: 'month',
      description: ''
    }
  });

  const watchedAmount = watch('amount');
  const watchedCategory = watch('category');

  // Reset form when budget prop changes
  useEffect(() => {
    if (budget) {
      reset({
        name: budget.name || '',
        amount: budget.amount || '',
        category: budget.category || '',
        period: budget.period || 'month',
        description: budget.description || ''
      });
    } else {
      reset({
        name: '',
        amount: '',
        category: '',
        period: 'month',
        description: ''
      });
    }
  }, [budget, reset]);

  // Get AI suggestions when amount or category changes
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
      const suggestions = await budgetService.getBudgetRecommendations({
        amount: parseFloat(amount),
        category
      });
      setAiSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } catch (error) {
      console.error('Failed to get AI suggestions:', error);
    }
  };

  const createMutation = useMutation(
    (data) => budgetService.createBudget(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['budget']);
        toast.success('Budget category created successfully!');
        onSuccess();
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to create budget category');
      }
    }
  );

  const updateMutation = useMutation(
    (data) => budgetService.updateBudget(budget.id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['budget']);
        toast.success('Budget category updated successfully!');
        onSuccess();
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to update budget category');
      }
    }
  );

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const budgetData = {
        ...data,
        amount: parseFloat(data.amount)
      };

      if (budget) {
        await updateMutation.mutateAsync(budgetData);
      } else {
        await createMutation.mutateAsync(budgetData);
      }
    } catch (error) {
      console.error('Budget submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    if (suggestion.recommendedAmount) {
      setValue('amount', suggestion.recommendedAmount);
    }
    if (suggestion.category) {
      setValue('category', suggestion.category);
    }
    setShowSuggestions(false);
  };

  const categories = [
    'Food & Dining',
    'Transportation',
    'Entertainment',
    'Shopping',
    'Utilities',
    'Healthcare',
    'Education',
    'Housing',
    'Insurance',
    'Investments',
    'Other'
  ];

  const periods = [
    { value: 'week', label: 'Weekly' },
    { value: 'month', label: 'Monthly' },
    { value: 'quarter', label: 'Quarterly' },
    { value: 'year', label: 'Yearly' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={onClose}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {budget ? 'Edit Budget Category' : 'Add Budget Category'}
                </h3>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Category Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category Name
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      {...register('name', { required: 'Category name is required' })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Enter category name"
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Amount and Period */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Budget Amount
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="number"
                        step="0.01"
                        {...register('amount', { 
                          required: 'Amount is required',
                          min: { value: 0.01, message: 'Amount must be greater than 0' }
                        })}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        placeholder="0.00"
                      />
                    </div>
                    {errors.amount && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.amount.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Period
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <select
                        {...register('period', { required: 'Period is required' })}
                        className="w-full pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      >
                        {periods.map((period) => (
                          <option key={period.value} value={period.value}>
                            {period.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <select
                      {...register('category', { required: 'Category is required' })}
                      className="w-full pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Select category</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.category.message}
                    </p>
                  )}
                </div>

                {/* AI Suggestions */}
                {showSuggestions && aiSuggestions.length > 0 && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-xs font-medium text-blue-800 dark:text-blue-200 mb-2">
                      AI Recommendations:
                    </p>
                    <div className="space-y-1">
                      {aiSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="block w-full text-left p-2 text-xs text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800/30 rounded"
                        >
                          <div className="flex items-center justify-between">
                            <span>{suggestion.action}</span>
                            {suggestion.recommendedAmount && (
                              <span className="text-blue-500 dark:text-blue-400">
                                {formatCurrency(suggestion.recommendedAmount)}
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    {...register('description')}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Add any additional notes about this budget category..."
                  />
                </div>

                {/* Submit Button */}
                <div className="flex items-center justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        {budget ? 'Update' : 'Create'} Budget
                      </>
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

export default BudgetModal; 