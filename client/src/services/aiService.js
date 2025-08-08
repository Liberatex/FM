import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const aiService = {
  // Analyze transactions and provide insights
  async analyzeTransactions(transactions) {
    try {
      const response = await api.post('/ai/analyze-transactions', { transactions });
      return response.data.insights || [];
    } catch (error) {
      console.error('Error analyzing transactions:', error);
      // Return mock insights if AI service is not available
      return generateMockInsights(transactions);
    }
  },

  // Get personalized recommendations
  async getRecommendations(userId) {
    try {
      const response = await api.get(`/ai/recommendations/${userId}`);
      return response.data.recommendations || [];
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      return [];
    }
  },

  // Analyze financial decision
  async analyzeDecision(decisionData) {
    try {
      const response = await api.post('/ai/analyze-decision', decisionData);
      return response.data;
    } catch (error) {
      console.error('Error analyzing decision:', error);
      throw new Error(error.response?.data?.message || 'Failed to analyze decision');
    }
  },

  // Get spending predictions
  async getSpendingPredictions(period = '30d') {
    try {
      const response = await api.get(`/ai/predictions/spending?period=${period}`);
      return response.data.predictions || [];
    } catch (error) {
      console.error('Error fetching spending predictions:', error);
      return [];
    }
  },

  // Get budget recommendations
  async getBudgetRecommendations(currentBudget) {
    try {
      const response = await api.post('/ai/budget-recommendations', { currentBudget });
      return response.data.recommendations || [];
    } catch (error) {
      console.error('Error fetching budget recommendations:', error);
      return [];
    }
  },

  // Get investment suggestions
  async getInvestmentSuggestions(userProfile) {
    try {
      const response = await api.post('/ai/investment-suggestions', { userProfile });
      return response.data.suggestions || [];
    } catch (error) {
      console.error('Error fetching investment suggestions:', error);
      return [];
    }
  },

  // Get financial health score
  async getFinancialHealthScore() {
    try {
      const response = await api.get('/ai/financial-health-score');
      return response.data.score || 0;
    } catch (error) {
      console.error('Error fetching financial health score:', error);
      return 0;
    }
  },

  // Get smart categorization
  async getSmartCategorization(transactions) {
    try {
      const response = await api.post('/ai/smart-categorization', { transactions });
      return response.data.categorizedTransactions || transactions;
    } catch (error) {
      console.error('Error getting smart categorization:', error);
      return transactions;
    }
  },

  // Get anomaly detection
  async getAnomalyDetection(transactions) {
    try {
      const response = await api.post('/ai/anomaly-detection', { transactions });
      return response.data.anomalies || [];
    } catch (error) {
      console.error('Error detecting anomalies:', error);
      return [];
    }
  },

  // Get financial goals suggestions
  async getGoalSuggestions(userProfile) {
    try {
      const response = await api.post('/ai/goal-suggestions', { userProfile });
      return response.data.goals || [];
    } catch (error) {
      console.error('Error fetching goal suggestions:', error);
      return [];
    }
  },

  // Get debt optimization suggestions
  async getDebtOptimizationSuggestions(debtData) {
    try {
      const response = await api.post('/ai/debt-optimization', { debtData });
      return response.data.suggestions || [];
    } catch (error) {
      console.error('Error fetching debt optimization suggestions:', error);
      return [];
    }
  },

  // Get tax optimization suggestions
  async getTaxOptimizationSuggestions(taxData) {
    try {
      const response = await api.post('/ai/tax-optimization', { taxData });
      return response.data.suggestions || [];
    } catch (error) {
      console.error('Error fetching tax optimization suggestions:', error);
      return [];
    }
  },

  // Get retirement planning suggestions
  async getRetirementPlanningSuggestions(userProfile) {
    try {
      const response = await api.post('/ai/retirement-planning', { userProfile });
      return response.data.suggestions || [];
    } catch (error) {
      console.error('Error fetching retirement planning suggestions:', error);
      return [];
    }
  },

  // Get emergency fund recommendations
  async getEmergencyFundRecommendations(userProfile) {
    try {
      const response = await api.post('/ai/emergency-fund', { userProfile });
      return response.data.recommendations || [];
    } catch (error) {
      console.error('Error fetching emergency fund recommendations:', error);
      return [];
    }
  },

  // Get insurance recommendations
  async getInsuranceRecommendations(userProfile) {
    try {
      const response = await api.post('/ai/insurance-recommendations', { userProfile });
      return response.data.recommendations || [];
    } catch (error) {
      console.error('Error fetching insurance recommendations:', error);
      return [];
    }
  },

  // Get credit score improvement suggestions
  async getCreditScoreSuggestions(creditData) {
    try {
      const response = await api.post('/ai/credit-score-improvement', { creditData });
      return response.data.suggestions || [];
    } catch (error) {
      console.error('Error fetching credit score suggestions:', error);
      return [];
    }
  },

  // Get financial education content
  async getFinancialEducationContent(topic) {
    try {
      const response = await api.get(`/ai/financial-education?topic=${topic}`);
      return response.data.content || [];
    } catch (error) {
      console.error('Error fetching financial education content:', error);
      return [];
    }
  },

  // Get personalized financial plan
  async getPersonalizedFinancialPlan(userProfile) {
    try {
      const response = await api.post('/ai/personalized-plan', { userProfile });
      return response.data.plan || {};
    } catch (error) {
      console.error('Error fetching personalized financial plan:', error);
      return {};
    }
  }
};

// Helper function to generate mock insights
function generateMockInsights(transactions) {
  if (!transactions || transactions.length === 0) {
    return [];
  }

  const insights = [];
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

  // Savings rate insights
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
  const categorySpending = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const topCategory = Object.entries(categorySpending)
    .sort(([,a], [,b]) => b - a)[0];

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

  // Income vs expense insights
  if (totalExpense > totalIncome) {
    insights.push({
      id: 4,
      type: 'negative',
      title: 'Spending Exceeds Income',
      message: `Your expenses ($${totalExpense.toFixed(2)}) exceed your income ($${totalIncome.toFixed(2)}). This is unsustainable long-term.`,
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

  return insights.slice(0, 5); // Limit to 5 insights
}

export default aiService; 