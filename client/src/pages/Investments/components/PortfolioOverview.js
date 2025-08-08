import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Activity } from 'lucide-react';
import { formatCurrency, formatPercentage } from '../../../utils/formatters';

const PortfolioOverview = ({ data }) => {
  const {
    totalValue = 45000,
    totalGain = 3200,
    gainPercentage = 7.6,
    monthlyChange = 850,
    topPerformers = [],
    riskScore = 65,
    diversificationScore = 78
  } = data || {};

  const defaultTopPerformers = [
    { name: 'AAPL', gain: 12.5 },
    { name: 'TSLA', gain: 8.3 },
    { name: 'MSFT', gain: 6.7 }
  ];

  const performers = topPerformers.length > 0 ? topPerformers : defaultTopPerformers;

  const getRiskColor = (score) => {
    if (score <= 30) return 'text-green-600 dark:text-green-400';
    if (score <= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getDiversificationColor = (score) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Portfolio Overview
      </h3>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Total Value</span>
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {formatCurrency(totalValue)}
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Total Gain</span>
          </div>
          <p className="text-lg font-semibold text-green-600 dark:text-green-400">
            {formatCurrency(totalGain)}
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-purple-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Risk Score</span>
          </div>
          <p className={`text-lg font-semibold ${getRiskColor(riskScore)}`}>
            {riskScore}/100
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-orange-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Diversification</span>
          </div>
          <p className={`text-lg font-semibold ${getDiversificationColor(diversificationScore)}`}>
            {diversificationScore}/100
          </p>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-semibold mb-2">Portfolio Performance</h4>
            <p className="text-3xl font-bold">{formatPercentage(gainPercentage / 100)}</p>
            <p className="text-blue-100 text-sm mt-1">
              {gainPercentage >= 0 ? '+' : ''}{formatCurrency(monthlyChange)} this month
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 mb-2">
              {gainPercentage >= 0 ? (
                <TrendingUp className="w-6 h-6 text-green-300" />
              ) : (
                <TrendingDown className="w-6 h-6 text-red-300" />
              )}
              <span className="text-lg font-semibold">
                {gainPercentage >= 0 ? '+' : ''}{formatPercentage(gainPercentage / 100)}
              </span>
            </div>
            <p className="text-blue-100 text-sm">
              Total return
            </p>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Top Performers
        </h4>
        <div className="space-y-2">
          {performers.map((performer, index) => (
            <motion.div
              key={performer.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                    {performer.name}
                  </span>
                </div>
                <span className="font-medium text-gray-900 dark:text-white">
                  {performer.name}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                  +{formatPercentage(performer.gain / 100)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PortfolioOverview; 