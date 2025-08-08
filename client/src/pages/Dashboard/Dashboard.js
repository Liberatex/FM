import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PiggyBank, 
  CreditCard, 
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

// Components
import FinancialOverview from './components/FinancialOverview';
import AIInsights from './components/AIInsights';
import RecentTransactions from './components/RecentTransactions';
import SpendingChart from './components/SpendingChart';
import GoalProgress from './components/GoalProgress';
import QuickActions from './components/QuickActions';
import InterventionAlert from './components/InterventionAlert';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

// Hooks
import { useQuery } from 'react-query';
import { useInterventions } from '../../hooks/useInterventions';
import { useFinancialData } from '../../hooks/useFinancialData';

// Services
import { dashboardService } from '../../services/dashboardService';

// Utils
import { formatCurrency, formatPercentage } from '../../utils/formatters';

const Dashboard = () => {
  const { interventions } = useInterventions();
  const { financialData, isLoading: financialLoading } = useFinancialData();
  
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch dashboard data
  const { data: dashboardData, isLoading, error, refetch } = useQuery(
    ['dashboard', selectedPeriod],
    () => dashboardService.getDashboardData(selectedPeriod),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    }
  );

  // Get latest intervention
  const latestIntervention = interventions.length > 0 ? interventions[0] : null;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  if (isLoading || financialLoading) {
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
          Error Loading Dashboard
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {error.message || 'Failed to load dashboard data'}
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
    overview,
    insights,
    recentTransactions,
    spendingData,
    goals,
    quickStats
  } = dashboardData || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Financial Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Your financial health at a glance
          </p>
        </div>
        
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isRefreshing ? (
              <LoadingSpinner size="sm" />
            ) : (
              'Refresh'
            )}
          </button>
        </div>
      </div>

      {/* AI Intervention Alert */}
      {latestIntervention && !latestIntervention.isRead && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <InterventionAlert intervention={latestIntervention} />
        </motion.div>
      )}

      {/* Financial Overview Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <FinancialOverview
          title="Net Worth"
          value={overview?.netWorth || 0}
          change={overview?.netWorthChange || 0}
          icon={TrendingUp}
          color="green"
        />
        
        <FinancialOverview
          title="Monthly Income"
          value={overview?.monthlyIncome || 0}
          change={overview?.incomeChange || 0}
          icon={DollarSign}
          color="blue"
        />
        
        <FinancialOverview
          title="Monthly Expenses"
          value={overview?.monthlyExpenses || 0}
          change={overview?.expensesChange || 0}
          icon={CreditCard}
          color="red"
        />
        
        <FinancialOverview
          title="Savings Rate"
          value={overview?.savingsRate || 0}
          change={overview?.savingsRateChange || 0}
          icon={PiggyBank}
          color="purple"
          isPercentage
        />
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Charts and Insights */}
        <div className="lg:col-span-2 space-y-6">
          {/* Spending Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Spending Overview
              </h2>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <BarChart3 className="w-4 h-4" />
                <span>Last {selectedPeriod}</span>
              </div>
            </div>
            <SpendingChart data={spendingData} period={selectedPeriod} />
          </motion.div>

          {/* AI Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <AIInsights insights={insights} />
          </motion.div>

          {/* Recent Transactions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Transactions
              </h2>
              <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 text-sm font-medium">
                View All
              </button>
            </div>
            <RecentTransactions transactions={recentTransactions} />
          </motion.div>
        </div>

        {/* Right Column - Goals and Quick Actions */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Quick Stats
            </h2>
            <div className="space-y-4">
              {quickStats?.map((stat, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${stat.color}`}>
                      {stat.icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {stat.label}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {stat.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                    {stat.change && (
                      <p className={`text-xs ${stat.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {stat.change > 0 ? '+' : ''}{formatPercentage(stat.change)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Goal Progress */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <GoalProgress goals={goals} />
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <QuickActions />
          </motion.div>
        </div>
      </div>

      {/* Bottom Section - Additional Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Financial Health Score */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Financial Health Score
            </h3>
            <Activity className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {overview?.financialHealthScore || 0}/100
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${overview?.financialHealthScore || 0}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {overview?.financialHealthScore >= 80 ? 'Excellent' :
               overview?.financialHealthScore >= 60 ? 'Good' :
               overview?.financialHealthScore >= 40 ? 'Fair' : 'Needs Improvement'}
            </p>
          </div>
        </div>

        {/* Upcoming Bills */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Upcoming Bills
            </h3>
            <Clock className="w-5 h-5 text-orange-600" />
          </div>
          <div className="space-y-3">
            {dashboardData?.upcomingBills?.slice(0, 3).map((bill, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {bill.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Due {bill.dueDate}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(bill.amount)}
                  </p>
                  <p className={`text-xs ${bill.daysUntilDue <= 3 ? 'text-red-600' : 'text-gray-600 dark:text-gray-400'}`}>
                    {bill.daysUntilDue} days
                  </p>
                </div>
              </div>
            ))}
            {(!dashboardData?.upcomingBills || dashboardData.upcomingBills.length === 0) && (
              <div className="text-center py-4">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  No upcoming bills
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard; 