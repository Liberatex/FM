import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, Calendar, TrendingUp, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import { investmentService } from '../../../services/investmentService';
import { formatCurrency } from '../../../utils/formatters';

const InvestmentModal = ({ investment, isOpen, onClose, onSuccess }) => {
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
      symbol: '',
      type: '',
      amount: '',
      shares: '',
      purchasePrice: '',
      purchaseDate: '',
      category: '',
      description: '',
      riskLevel: 'medium'
    }
  });

  const watchedAmount = watch('amount');
  const watchedType = watch('type');

  useEffect(() => {
    if (investment) {
      reset({
        name: investment.name || '',
        symbol: investment.symbol || '',
        type: investment.type || '',
        amount: investment.amount || '',
        shares: investment.shares || '',
        purchasePrice: investment.purchasePrice || '',
        purchaseDate: investment.purchaseDate || '',
        category: investment.category || '',
        description: investment.description || '',
        riskLevel: investment.riskLevel || 'medium'
      });
    } else {
      reset({
        name: '',
        symbol: '',
        type: '',
        amount: '',
        shares: '',
        purchasePrice: '',
        purchaseDate: '',
        category: '',
        description: '',
        riskLevel: 'medium'
      });
    }
  }, [investment, reset]);

  useEffect(() => {
    if (watchedAmount && watchedType) {
      const timer = setTimeout(() => {
        getAiSuggestions(watchedAmount, watchedType);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setAiSuggestions([]);
      setShowSuggestions(false);
    }
  }, [watchedAmount, watchedType]);

  const getAiSuggestions = async (amount, type) => {
    try {
      const suggestions = await investmentService.getInvestmentRecommendations({
        amount: parseFloat(amount),
        type
      });
      setAiSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } catch (error) {
      console.error('Failed to get AI suggestions:', error);
    }
  };

  const createInvestmentMutation = useMutation(
    (data) => investmentService.createInvestment(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('investments');
        toast.success('Investment added successfully!');
        onSuccess?.();
        onClose();
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to add investment');
      }
    }
  );

  const updateInvestmentMutation = useMutation(
    ({ id, data }) => investmentService.updateInvestment(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('investments');
        toast.success('Investment updated successfully!');
        onSuccess?.();
        onClose();
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to update investment');
      }
    }
  );

  const onSubmit = (data) => {
    setIsLoading(true);
    
    const investmentData = {
      ...data,
      amount: parseFloat(data.amount),
      shares: parseFloat(data.shares) || 0,
      purchasePrice: parseFloat(data.purchasePrice) || 0
    };

    if (investment) {
      updateInvestmentMutation.mutate({ id: investment.id, data: investmentData });
    } else {
      createInvestmentMutation.mutate(investmentData);
    }
  };

  const applySuggestion = (suggestion) => {
    if (suggestion.name) setValue('name', suggestion.name);
    if (suggestion.symbol) setValue('symbol', suggestion.symbol);
    if (suggestion.type) setValue('type', suggestion.type);
    if (suggestion.category) setValue('category', suggestion.category);
    if (suggestion.riskLevel) setValue('riskLevel', suggestion.riskLevel);
    if (suggestion.description) setValue('description', suggestion.description);
    setShowSuggestions(false);
  };

  const investmentTypes = [
    'Stock', 'ETF', 'Mutual Fund', 'Bond', 'Real Estate', 'Cryptocurrency',
    'Commodity', 'Index Fund', 'REIT', 'Options', 'Futures', 'Other'
  ];

  const categories = [
    'Technology', 'Healthcare', 'Finance', 'Consumer Goods', 'Energy',
    'Industrial', 'Materials', 'Utilities', 'Real Estate', 'Communication',
    'International', 'Emerging Markets', 'Bonds', 'Cash', 'Other'
  ];

  const riskLevels = [
    { value: 'low', label: 'Low Risk', color: 'text-green-600' },
    { value: 'medium', label: 'Medium Risk', color: 'text-yellow-600' },
    { value: 'high', label: 'High Risk', color: 'text-red-600' }
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
                  {investment ? 'Edit Investment' : 'Add New Investment'}
                </h3>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Investment Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Investment Name *
                  </label>
                  <input
                    type="text"
                    {...register('name', { required: 'Investment name is required' })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., Apple Inc."
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                {/* Symbol */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Symbol
                  </label>
                  <input
                    type="text"
                    {...register('symbol')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., AAPL"
                  />
                </div>

                {/* Investment Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Investment Type *
                  </label>
                  <select
                    {...register('type', { required: 'Investment type is required' })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select investment type</option>
                    {investmentTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  {errors.type && (
                    <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
                  )}
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Investment Amount *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      step="0.01"
                      {...register('amount', { 
                        required: 'Investment amount is required',
                        min: { value: 0.01, message: 'Amount must be greater than 0' }
                      })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="0.00"
                    />
                  </div>
                  {errors.amount && (
                    <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
                  )}
                </div>

                {/* Shares */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Number of Shares
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('shares', { 
                      min: { value: 0, message: 'Shares cannot be negative' }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="0"
                  />
                  {errors.shares && (
                    <p className="mt-1 text-sm text-red-600">{errors.shares.message}</p>
                  )}
                </div>

                {/* Purchase Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Purchase Price per Share
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      step="0.01"
                      {...register('purchasePrice', { 
                        min: { value: 0, message: 'Price cannot be negative' }
                      })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="0.00"
                    />
                  </div>
                  {errors.purchasePrice && (
                    <p className="mt-1 text-sm text-red-600">{errors.purchasePrice.message}</p>
                  )}
                </div>

                {/* Purchase Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Purchase Date *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      {...register('purchaseDate', { required: 'Purchase date is required' })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  {errors.purchaseDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.purchaseDate.message}</p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <select
                    {...register('category')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Risk Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Risk Level
                  </label>
                  <select
                    {...register('riskLevel')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    {riskLevels.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
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
                    placeholder="Describe your investment strategy..."
                  />
                </div>

                {/* AI Suggestions */}
                {showSuggestions && aiSuggestions.length > 0 && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="w-4 h-4 text-blue-500" />
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
                            {suggestion.name}
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
                        {investment ? 'Updating...' : 'Adding...'}
                      </div>
                    ) : (
                      investment ? 'Update Investment' : 'Add Investment'
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

export default InvestmentModal; 