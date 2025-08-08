import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Lightbulb,
  DollarSign,
  Calendar,
  Target,
  Zap
} from 'lucide-react';

// Services
import { budgetService } from '../../../services/budgetService';

// Utils
import { formatCurrency } from '../../../utils/formatters';

const BudgetInsights = ({ insights, recommendations, isOverBudget, spendingPercentage }) => {
  const [aiInsights, setAiInsights] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (insights && insights.length > 0) {
      setAiInsights(insights);
    } else {
      generateMockInsights();
    }
  }, [insights]);

  const generateMockInsights = () => {
    const mockInsights = [];

    if (isOverBudget) {
      mockInsights.push({
        id: 1,
        type: 'warning',
        title: 'Budget Exceeded',
        message: `You've exceeded your budget by ${formatCurrency(Math.abs(spendingPercentage - 100))}. Consider reducing spending in high-expense categories.`,
        confidence: 95,
        action: 'Review and adjust your spending habits'
      });
    } else if (spendingPercentage > 90) {
      mockInsights.push({
        id: 2,
        type: 'warning',
        title: 'Approaching Budget Limit',
        message: `You're at ${spendingPercentage.toFixed(1)}% of your budget. Be cautious with additional spending this period.`,
        confidence: 88,
        action: 'Monitor your spending closely'
      });
    } else if (spendingPercentage < 70) {
      mockInsights.push({
        id: 3,
        type: 'positive',
        title: 'Excellent Budget Management',
        message: `You're only using ${spendingPercentage.toFixed(1)}% of your budget. Great job staying within your limits!`,
        confidence: 92,
        action: 'Consider saving the remaining amount'
      });
    }

    // Add general insights
    mockInsights.push({
      id: 4,
      type: 'tip',
      title: 'Budget Optimization',
      message: 'Consider setting up automatic transfers to your savings account to build wealth over time.',
      confidence: 85,
      action: 'Set up automatic savings'
    });

    setAiInsights(mockInsights);
  };

  const getInsightIcon = (type) => {
    switch (type) {
      case 'positive':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'negative':
        return <TrendingDown className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'tip':
        return <Lightbulb className="w-5 h-5 text-blue-500" />;
      case 'achievement':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Brain className="w-5 h-5 text-purple-500" />;
    }
  };

  const getInsightColor = (type) => {
    switch (type) {
      case 'positive':
        return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
      case 'negative':
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800';
      case 'tip':
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
      case 'achievement':
        return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
      default:
        return 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800';
    }
  };

  const getInsightTextColor = (type) => {
    switch (type) {
      case 'positive':
        return 'text-green-800 dark:text-green-200';
      case 'negative':
        return 'text-red-800 dark:text-red-200';
      case 'warning':
        return 'text-yellow-800 dark:text-yellow-200';
      case 'tip':
        return 'text-blue-800 dark:text-blue-200';
      case 'achievement':
        return 'text-green-800 dark:text-green-200';
      default:
        return 'text-purple-800 dark:text-purple-200';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-6 h-6 text-purple-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Budget Insights
          </h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Brain className="w-6 h-6 text-purple-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Budget Insights
          </h3>
        </div>
        <button
          onClick={generateMockInsights}
          className="flex items-center gap-2 px-3 py-1 text-xs font-medium text-purple-600 bg-purple-100 rounded-lg hover:bg-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:hover:bg-purple-900/40"
        >
          <Zap className="w-3 h-3" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {aiInsights.length === 0 ? (
        <div className="text-center py-8">
          <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            No insights available. Add budget categories to get AI-powered recommendations.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {aiInsights.map((insight, index) => (
            <motion.div
              key={insight.id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}
            >
              <div className="flex items-start gap-3">
                {getInsightIcon(insight.type)}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className={`text-sm font-semibold ${getInsightTextColor(insight.type)}`}>
                      {insight.title}
                    </h4>
                    {insight.confidence && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {insight.confidence}% confidence
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    {insight.message}
                  </p>
                  {insight.action && (
                    <div className="flex items-center gap-2">
                      <Target className="w-3 h-3 text-gray-400" />
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {insight.action}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Recommendations Section */}
      {recommendations && recommendations.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            AI Recommendations
          </h4>
          <div className="space-y-2">
            {recommendations.map((rec, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Lightbulb className="w-4 h-4 text-blue-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {rec.action}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Potential savings: {formatCurrency(rec.potentialSavings)}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  rec.difficulty === 'easy' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
                    : rec.difficulty === 'medium'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200'
                }`}>
                  {rec.difficulty}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insight Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-green-500" />
            <span className="text-gray-600 dark:text-gray-400">Positive</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingDown className="w-3 h-3 text-red-500" />
            <span className="text-gray-600 dark:text-gray-400">Negative</span>
          </div>
          <div className="flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-yellow-500" />
            <span className="text-gray-600 dark:text-gray-400">Warning</span>
          </div>
          <div className="flex items-center gap-1">
            <Lightbulb className="w-3 h-3 text-blue-500" />
            <span className="text-gray-600 dark:text-gray-400">Tip</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetInsights; 