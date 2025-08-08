import React from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react';

const InvestmentInsights = ({ insights = [] }) => {
  const defaultInsights = [
    {
      id: 1,
      type: 'positive',
      title: 'Strong Portfolio Performance',
      message: 'Your portfolio has outperformed the market by 2.3% this quarter. Consider rebalancing to maintain optimal allocation.',
      icon: TrendingUp
    },
    {
      id: 2,
      type: 'warning',
      title: 'Concentration Risk',
      message: 'Your portfolio is heavily concentrated in technology stocks. Consider diversifying into other sectors.',
      icon: AlertTriangle
    },
    {
      id: 3,
      type: 'tip',
      title: 'Rebalancing Opportunity',
      message: 'Market conditions suggest it\'s a good time to rebalance your portfolio for better risk-adjusted returns.',
      icon: Lightbulb
    }
  ];

  const displayInsights = insights.length > 0 ? insights : defaultInsights;

  const getInsightColor = (type) => {
    switch (type) {
      case 'positive':
        return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800';
      case 'tip':
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800';
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case 'positive':
        return 'text-green-500';
      case 'warning':
        return 'text-yellow-500';
      case 'tip':
        return 'text-blue-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <Brain className="w-6 h-6 text-purple-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Investment Insights
        </h3>
      </div>

      <div className="space-y-4">
        {displayInsights.map((insight, index) => {
          const IconComponent = insight.icon;
          
          return (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}
            >
              <div className="flex items-start gap-3">
                <IconComponent className={`w-5 h-5 ${getIconColor(insight.type)} mt-0.5`} />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                    {insight.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {insight.message}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default InvestmentInsights; 