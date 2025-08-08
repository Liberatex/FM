import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Calendar,
  BarChart3,
  PieChart,
  Settings,
  Download,
  Upload,
  Brain,
  Zap
} from 'lucide-react';

// Components
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import BudgetModal from './components/BudgetModal';
import BudgetChart from './components/BudgetChart';
import BudgetInsights from './components/BudgetInsights';
import CategoryBudget from './components/CategoryBudget';

// Hooks
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useInterventions } from '../../hooks/useInterventions';

// Services
import { budgetService } from '../../services/budgetService';

// Utils
import { formatCurrency, formatPercentage } from '../../utils/formatters';

const Budget = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const queryClient = useQueryClient();
  const { interventions } = useInterventions();

  // Fetch budget data
  const { data: budgetData, isLoading, error, refetch } = useQuery(
    ['budget', selectedPeriod],
    () => budgetService.getBudgetData(selectedPeriod),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    }
  );

  // Delete budget mutation
  const deleteMutation = useMutation(
    (budgetId) => budgetService.deleteBudget(budgetId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['budget']);
      }
    }
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const handleEditBudget = (budget) => {
    setSelectedBudget(budget);
    setIsModalOpen(true);
  };

  const handleDeleteBudget = async (budgetId) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      await deleteMutation.mutateAsync(budgetId);
    }
  };

  const handleExportBudget = () => {
    budgetService.exportBudget(selectedPeriod);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Error Loading Budget
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {error.message || 'Failed to load budget data'}
        </p>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const {
    totalBudget,
    totalSpent,
    totalRemaining,
    categories,
    monthlyTrends,
    insights,
    recommendations
  } = budgetData || {};

  const spendingPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const isOverBudget = totalSpent > totalBudget;
  const isNearLimit = spendingPercentage >= 90;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Budget Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track your spending and stay on budget
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          
          <button
            onClick={handleExportBudget}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Plus className="w-4 h-4" />
            Add Budget
          </button>
        </div>
      </div>

      {/* Budget Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Budget */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Budget</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(totalBudget || 0)}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Total Spent */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                isOverBudget 
                  ? 'bg-red-100 dark:bg-red-900/20' 
                  : 'bg-green-100 dark:bg-green-900/20'
              }`}>
                <TrendingDown className={`w-5 h-5 ${
                  isOverBudget 
                    ? 'text-red-600 dark:text-red-400' 
                    : 'text-green-600 dark:text-green-400'
                }`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Spent</p>
                <p className={`text-2xl font-bold ${
                  isOverBudget 
                    ? 'text-red-600 dark:text-red-400' 
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {formatCurrency(totalSpent || 0)}
                </p>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                isOverBudget 
                  ? 'bg-red-500' 
                  : isNearLimit 
                    ? 'bg-yellow-500' 
                    : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(spendingPercentage, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatPercentage(spendingPercentage)} of budget used
          </p>
        </motion.div>

        {/* Remaining */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                totalRemaining < 0 
                  ? 'bg-red-100 dark:bg-red-900/20' 
                  : 'bg-green-100 dark:bg-green-900/20'
              }`}>
                <TrendingUp className={`w-5 h-5 ${
                  totalRemaining < 0 
                    ? 'text-red-600 dark:text-red-400' 
                    : 'text-green-600 dark:text-green-400'
                }`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Remaining</p>
                <p className={`text-2xl font-bold ${
                  totalRemaining < 0 
                    ? 'text-red-600 dark:text-red-400' 
                    : 'text-gray-900 dark:text-white'
                }`}>
                  {formatCurrency(totalRemaining || 0)}
                </p>
              </div>
            </div>
          </div>
          
          {isOverBudget && (
            <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
              <AlertTriangle className="w-3 h-3" />
              <span>Over budget by {formatCurrency(Math.abs(totalRemaining))}</span>
            </div>
          )}
        </motion.div>
      </div>

      {/* Charts and Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BudgetChart 
          categories={categories} 
          monthlyTrends={monthlyTrends}
          period={selectedPeriod}
        />
        <BudgetInsights 
          insights={insights}
          recommendations={recommendations}
          isOverBudget={isOverBudget}
          spendingPercentage={spendingPercentage}
        />
      </div>

      {/* Category Budgets */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Category Budgets
            </h3>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1 text-sm font-medium text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40"
            >
              <Plus className="w-3 h-3" />
              Add Category
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {categories && categories.length > 0 ? (
            <div className="space-y-4">
              {categories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <CategoryBudget
                    category={category}
                    onEdit={() => handleEditBudget(category)}
                    onDelete={() => handleDeleteBudget(category.id)}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No budget categories set
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Create your first budget category to start tracking your spending
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Budget Category
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Budget Modal */}
      {isModalOpen && (
        <BudgetModal
          budget={selectedBudget}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedBudget(null);
          }}
          onSuccess={() => {
            queryClient.invalidateQueries(['budget']);
            setIsModalOpen(false);
            setSelectedBudget(null);
          }}
        />
      )}
    </div>
  );
};

export default Budget; 