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
  Zap,
  Award
} from 'lucide-react';

// Services
import { goalService } from '../../../services/goalService';

// Utils
import { formatCurrency } from '../../../utils/formatters';

const GoalInsights = ({ goals, insights, recommendations }) => {
  const [aiInsights, setAiInsights] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (insights && insights.length > 0) {
      setAiInsights(insights);
    } else {
      generateMockInsights();
    }
  }, [insights, goals]);

  const generateMockInsights = () => {
    const mockInsights = [];
    
    if (!goals || goals.length === 0) {
      mockInsights.push({
        id: 1,
        type: 'tip',
        title: 'Start Setting Goals',
        message: 'Create your first financial goal to begin your journey towards financial success.',
        confidence: 95,
        action: 'Create your first goal'
      });
      setAiInsights(mockInsights);
      return;
    }

    const activeGoals = goals.filter(goal => goal.currentAmount < goal.targetAmount);
    const completedGoals = goals.filter(goal => goal.currentAmount >= goal.targetAmount);
    const overdueGoals = goals.filter(goal => {
      const daysRemaining = Math.ceil((new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24));
      return daysRemaining < 0 && goal.currentAmount < goal.targetAmount;
    });

    // Completion rate insight
    const completionRate = (completedGoals.length / goals.length) * 100;
    if (completionRate > 50) {
      mockInsights.push({
        id: 2,
        type: 'positive',
        title: 'Excellent Goal Achievement',
        message: `You've completed ${completionRate.toFixed(1)}% of your goals. Keep up the great work!`,
        confidence: 92,
        action: 'Set new challenging goals'
      });
    } else if (completionRate > 25) {
      mockInsights.push({
        id: 3,
        type: 'tip',
        title: 'Good Progress',
        message: `You've completed ${completionRate.toFixed(1)}% of your goals. Focus on the remaining ones.`,
        confidence: 88,
        action: 'Review and adjust strategies'
      });
    }

    // Overdue goals warning
    if (overdueGoals.length > 0) {
      mockInsights.push({
        id: 4,
        type: 'warning',
        title: 'Overdue Goals Detected',
        message: `You have ${overdueGoals.length} overdue goal${overdueGoals.length > 1 ? 's' : ''}. Consider extending deadlines or adjusting targets.`,
        confidence: 90,
        action: 'Review overdue goals'
      });
    }

    // High priority goals insight
    const highPriorityGoals = goals.filter(goal => goal.priority === 'high');
    if (highPriorityGoals.length > 0) {
      const highPriorityProgress = highPriorityGoals.reduce((sum, goal) => 
        sum + (goal.currentAmount / goal.targetAmount), 0) / highPriorityGoals.length;
      
      if (highPriorityProgress < 0.5) {
        mockInsights.push({
          id: 5,
          type: 'warning',
          title: 'Focus on High Priority Goals',
          message: 'Your high priority goals need more attention. Consider reallocating resources.',
          confidence: 85,
          action: 'Prioritize high-value goals'
        });
      }
    }

    // Savings rate insight
    const totalTarget = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
    const totalCurrent = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
    const overallProgress = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;
    
    if (overallProgress > 75) {
      mockInsights.push({
        id: 6,
        type: 'positive',
        title: 'Outstanding Progress',
        message: `You're ${overallProgress.toFixed(1)}% towards your total goal target. Excellent savings discipline!`,
        confidence: 94,
        action: 'Consider increasing targets'
      });
    }

    // Goal diversification insight
    const categories = [...new Set(goals.map(goal => goal.category))];
    if (categories.length >= 3) {
      mockInsights.push({
        id: 7,
        type: 'positive',
        title: 'Well-Diversified Goals',
        message: `You have goals across ${categories.length} different categories. Great financial planning!`,
        confidence: 87,
        action: 'Maintain diversification'
      });
    } else if (categories.length === 1) {
      mockInsights.push({
        id: 8,
        type: 'tip',
        title: 'Consider Goal Diversification',
        message: 'All your goals are in the same category. Consider diversifying for better financial health.',
        confidence: 82,
        action: 'Add different goal types'
      });
    }

    // Timeline optimization
    const nearDeadlineGoals = goals.filter(goal => {
      const daysRemaining = Math.ceil((new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24));
      return daysRemaining <= 30 && daysRemaining > 0 && goal.currentAmount < goal.targetAmount;
    });

    if (nearDeadlineGoals.length > 0) {
      mockInsights.push({
        id: 9,
        type: 'warning',
        title: 'Approaching Deadlines',
        message: `You have ${nearDeadlineGoals.length} goal${nearDeadlineGoals.length > 1 ? 's' : ''} with deadlines within 30 days.`,
        confidence: 89,
        action: 'Accelerate progress or adjust timelines'
      });
    }

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
        return <Award className="w-5 h-5 text-green-500" />;
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
            Goal Insights
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
            Goal Insights
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
          <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            No insights available. Create some goals to get AI-powered recommendations.
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
                    Expected impact: {rec.impact}
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
          <div className="flex items-center gap-1">
            <Award className="w-3 h-3 text-green-500" />
            <span className="text-gray-600 dark:text-gray-400">Achievement</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalInsights; 