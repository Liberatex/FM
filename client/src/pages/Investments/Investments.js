import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3,
  PieChart,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Target,
  Brain,
  Zap,
  Download,
  Filter,
  Activity,
  Globe,
  Shield
} from 'lucide-react';

// Components
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import InvestmentModal from './components/InvestmentModal';
import PortfolioOverview from './components/PortfolioOverview';
import InvestmentChart from './components/InvestmentChart';
import InvestmentInsights from './components/InvestmentInsights';
import AssetAllocation from './components/AssetAllocation';

// Hooks
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useInterventions } from '../../hooks/useInterventions';

// Services
import { investmentService } from '../../services/investmentService';

// Utils
import { formatCurrency, formatPercentage } from '../../utils/formatters';

const Investments = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('1y');
  const [selectedInvestment, setSelectedInvestment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const queryClient = useQueryClient();
  const { interventions } = useInterventions();

  // Fetch investment data
  const { data: investmentData, isLoading, error, refetch } = useQuery(
    ['investments', selectedPeriod],
    () => investmentService.getInvestmentData(selectedPeriod),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    }
  );

  // Delete investment mutation
  const deleteMutation = useMutation(
    (investmentId) => investmentService.deleteInvestment(investmentId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['investments']);
      }
    }
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const handleEditInvestment = (investment) => {
    setSelectedInvestment(investment);
    setIsModalOpen(true);
  };

  const handleDeleteInvestment = async (investmentId) => {
    if (window.confirm('Are you sure you want to delete this investment?')) {
      await deleteMutation.mutateAsync(investmentId);
    }
  };

  const handleExportInvestments = () => {
    investmentService.exportInvestments(selectedPeriod);
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
          Error Loading Investments
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {error.message || 'Failed to load investment data'}
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
    totalValue,
    totalGain,
    totalGainPercentage,
    portfolio,
    performance,
    insights,
    recommendations,
    assetAllocation,
    riskMetrics
  } = investmentData || {};

  const isPositiveReturn = totalGain >= 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Investment Portfolio
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track your investments and optimize your portfolio
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="1m">1 Month</option>
            <option value="3m">3 Months</option>
            <option value="6m">6 Months</option>
            <option value="1y">1 Year</option>
            <option value="3y">3 Years</option>
            <option value="5y">5 Years</option>
            <option value="all">All Time</option>
          </select>
          
          <button
            onClick={handleExportInvestments}
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
            Add Investment
          </button>
        </div>
      </div>

      {/* Portfolio Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Portfolio Value */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Portfolio Value</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(totalValue || 0)}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Total Gain/Loss */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-lg ${
              isPositiveReturn 
                ? 'bg-green-100 dark:bg-green-900/20' 
                : 'bg-red-100 dark:bg-red-900/20'
            }`}>
              {isPositiveReturn ? (
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Gain/Loss</p>
              <p className={`text-2xl font-bold ${
                isPositiveReturn 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {formatCurrency(totalGain || 0)}
              </p>
            </div>
          </div>
          <p className={`text-sm ${
            isPositiveReturn 
              ? 'text-green-600 dark:text-green-400' 
              : 'text-red-600 dark:text-red-400'
          }`}>
            {formatPercentage(totalGainPercentage || 0)}
          </p>
        </motion.div>

        {/* Risk Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <Shield className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Risk Score</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {riskMetrics?.riskScore || 'N/A'}
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {riskMetrics?.riskLevel || 'Moderate'}
          </p>
        </motion.div>

        {/* Diversification Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Globe className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Diversification</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatPercentage(riskMetrics?.diversificationScore || 0)}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InvestmentChart 
          performance={performance}
          period={selectedPeriod}
        />
        <AssetAllocation 
          allocation={assetAllocation}
        />
      </div>

      {/* Portfolio Overview and Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PortfolioOverview 
          portfolio={portfolio}
          onEdit={handleEditInvestment}
          onDelete={handleDeleteInvestment}
        />
        <InvestmentInsights 
          insights={insights}
          recommendations={recommendations}
          isPositiveReturn={isPositiveReturn}
          totalGainPercentage={totalGainPercentage}
        />
      </div>

      {/* Investment Modal */}
      {isModalOpen && (
        <InvestmentModal
          investment={selectedInvestment}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedInvestment(null);
          }}
          onSuccess={() => {
            queryClient.invalidateQueries(['investments']);
            setIsModalOpen(false);
            setSelectedInvestment(null);
          }}
        />
      )}
    </div>
  );
};

export default Investments; 