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
import { aiService } from '../../../services/aiService';

// Utils
import { formatCurrency } from '../../../utils/formatters';

const AIInsights = ({ transactions }) => {
  const [insights, setInsights] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (transactions && transactions.length > 0) {
      generateInsights();
    }
  }, [transactions]);

  const generateInsights = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const aiInsights = await aiService.analyzeTransactions(transactions);
      setInsights(aiInsights);
    } catch (err) {
      setError('Failed to generate AI insights');
      console.error('AI insights error:', err);
    } finally {
      setIsLoading(false);
    }
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

  // Generate mock insights if AI service is not available
  const generateMockInsights = () => {
    if (!transactions || transactions.length === 0) {
      return [];
    }

    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;
    
    const categorySpending = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {});

    const topCategory = Object.entries(categorySpending)
      .sort(([,a], [,b]) => b - a)[0];

    const insights = [];

    // Savings rate insight
    if (savingsRate > 20) {
      insights.push({
        id: 1,
        type: 'achievement',
        title: 'Excellent Savings Rate!',
        message: `You're saving ${savingsRate.toFixed(1)}% of your income, which is above the recommended 20%. Keep up the great work!`,
        confidence: 95,
        action: 'Continue your current saving habits'
      });
    } else if (savingsRate < 10) {
      insights.push({
        id: 2,
        type: 'warning',
        title: 'Low Savings Rate Detected',
        message: `Your savings rate is ${savingsRate.toFixed(1)}%. Consider increasing your savings to at least 20% for better financial security.`,
        confidence: 88,
        action: 'Review your expenses and identify areas to cut back'
      });
    }

    // Spending pattern insights
    if (topCategory) {
      const [category, amount] = topCategory;
      const percentage = (amount / totalExpense) * 100;
      
      if (percentage > 40) {
        insights.push({
          id: 3,
          type: 'warning',
          title: 'High Concentration in One Category',
          message: `${category} accounts for ${percentage.toFixed(1)}% of your expenses. Consider diversifying your spending.`,
          confidence: 92,
          action: 'Review your budget allocation for this category'
        });
      }
    }

    // Income vs expense insight
    if (totalExpense > totalIncome) {
      insights.push({
        id: 4,
        type: 'negative',
        title: 'Spending Exceeds Income',
        message: `Your expenses (${formatCurrency(totalExpense)}) exceed your income (${formatCurrency(totalIncome)}). This is unsustainable long-term.`,
        confidence: 96,
        action: 'Immediately reduce expenses or increase income'
      });
    } else if (totalIncome > totalExpense * 1.5) {
      insights.push({
        id: 5,
        type: 'positive',
        title: 'Strong Financial Position',
        message: `Your income is ${((totalIncome / totalExpense - 1) * 100).toFixed(1)}% higher than expenses. Great financial discipline!`,
        confidence: 94,
        action: 'Consider investing your surplus income'
      });
    }

    // Transaction frequency insight
    const recentTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return transactionDate >= thirtyDaysAgo;
    });

    if (recentTransactions.length > 50) {
      insights.push({
        id: 6,
        type: 'tip',
        title: 'High Transaction Frequency',
        message: `You've made ${recentTransactions.length} transactions in the last 30 days. Consider consolidating smaller purchases.`,
        confidence: 87,
        action: 'Batch similar transactions to reduce processing fees'
      });
    }

    return insights.slice(0, 5); // Limit to 5 insights
  };

  const displayInsights = insights.length > 0 ? insights : generateMockInsights();

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-6 h-6 text-purple-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            AI Insights
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
            AI Insights
          </h3>
        </div>
        <button
          onClick={generateInsights}
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

      {displayInsights.length === 0 ? (
        <div className="text-center py-8">
          <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            No insights available. Add more transactions to get AI-powered recommendations.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayInsights.map((insight, index) => (
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

export default AIInsights; 