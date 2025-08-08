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

export const budgetService = {
  // Get budget data for a specific period
  async getBudgetData(period = 'month') {
    try {
      const response = await api.get(`/financial/budget?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching budget data:', error);
      // Return mock data if API is not available
      return generateMockBudgetData(period);
    }
  },

  // Create new budget category
  async createBudget(budgetData) {
    try {
      const response = await api.post('/financial/budget', budgetData);
      return response.data;
    } catch (error) {
      console.error('Error creating budget:', error);
      throw new Error(error.response?.data?.message || 'Failed to create budget');
    }
  },

  // Update budget category
  async updateBudget(budgetId, budgetData) {
    try {
      const response = await api.put(`/financial/budget/${budgetId}`, budgetData);
      return response.data;
    } catch (error) {
      console.error('Error updating budget:', error);
      throw new Error(error.response?.data?.message || 'Failed to update budget');
    }
  },

  // Delete budget category
  async deleteBudget(budgetId) {
    try {
      const response = await api.delete(`/financial/budget/${budgetId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting budget:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete budget');
    }
  },

  // Get budget by ID
  async getBudget(budgetId) {
    try {
      const response = await api.get(`/financial/budget/${budgetId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching budget:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch budget');
    }
  },

  // Get budget recommendations
  async getBudgetRecommendations(userProfile) {
    try {
      const response = await api.post('/ai/budget-recommendations', { userProfile });
      return response.data.recommendations || [];
    } catch (error) {
      console.error('Error fetching budget recommendations:', error);
      return generateMockBudgetRecommendations();
    }
  },

  // Export budget data
  async exportBudget(period = 'month', format = 'csv') {
    try {
      const response = await api.get(`/financial/budget/export?period=${period}&format=${format}`, {
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `budget-${period}-${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('Error exporting budget:', error);
      throw new Error(error.response?.data?.message || 'Failed to export budget');
    }
  },

  // Get budget statistics
  async getBudgetStats(period = 'month') {
    try {
      const response = await api.get(`/financial/budget/stats?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching budget stats:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch budget statistics');
    }
  },

  // Get budget categories
  async getBudgetCategories() {
    try {
      const response = await api.get('/financial/budget/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching budget categories:', error);
      return getDefaultBudgetCategories();
    }
  },

  // Get budget alerts
  async getBudgetAlerts() {
    try {
      const response = await api.get('/financial/budget/alerts');
      return response.data.alerts || [];
    } catch (error) {
      console.error('Error fetching budget alerts:', error);
      return [];
    }
  },

  // Update budget spending
  async updateBudgetSpending(categoryId, amount) {
    try {
      const response = await api.post(`/financial/budget/${categoryId}/spending`, { amount });
      return response.data;
    } catch (error) {
      console.error('Error updating budget spending:', error);
      throw new Error(error.response?.data?.message || 'Failed to update budget spending');
    }
  },

  // Get budget insights
  async getBudgetInsights(period = 'month') {
    try {
      const response = await api.get(`/financial/budget/insights?period=${period}`);
      return response.data.insights || [];
    } catch (error) {
      console.error('Error fetching budget insights:', error);
      return generateMockBudgetInsights();
    }
  }
};

// Helper functions
function generateMockBudgetData(period) {
  const categories = [
    {
      id: 1,
      name: 'Food & Dining',
      budget: 500,
      spent: 320,
      remaining: 180,
      percentage: 64
    },
    {
      id: 2,
      name: 'Transportation',
      budget: 300,
      spent: 280,
      remaining: 20,
      percentage: 93
    },
    {
      id: 3,
      name: 'Entertainment',
      budget: 200,
      spent: 150,
      remaining: 50,
      percentage: 75
    },
    {
      id: 4,
      name: 'Shopping',
      budget: 400,
      spent: 450,
      remaining: -50,
      percentage: 112
    },
    {
      id: 5,
      name: 'Utilities',
      budget: 250,
      spent: 240,
      remaining: 10,
      percentage: 96
    }
  ];

  const totalBudget = categories.reduce((sum, cat) => sum + cat.budget, 0);
  const totalSpent = categories.reduce((sum, cat) => sum + cat.spent, 0);
  const totalRemaining = totalBudget - totalSpent;

  return {
    totalBudget,
    totalSpent,
    totalRemaining,
    categories,
    monthlyTrends: generateMockTrends(),
    insights: generateMockBudgetInsights(),
    recommendations: generateMockBudgetRecommendations()
  };
}

function generateMockTrends() {
  return [
    { month: 'Jan', budget: 1500, spent: 1400 },
    { month: 'Feb', budget: 1500, spent: 1600 },
    { month: 'Mar', budget: 1500, spent: 1350 },
    { month: 'Apr', budget: 1500, spent: 1450 },
    { month: 'May', budget: 1500, spent: 1550 },
    { month: 'Jun', budget: 1500, spent: 1300 }
  ];
}

function generateMockBudgetInsights() {
  return [
    {
      id: 1,
      type: 'warning',
      title: 'High Spending in Shopping Category',
      message: 'You\'ve exceeded your shopping budget by 12.5%. Consider reducing non-essential purchases.',
      confidence: 85
    },
    {
      id: 2,
      type: 'positive',
      title: 'Excellent Budget Management',
      message: 'You\'re on track with your overall budget. Keep up the good work!',
      confidence: 92
    },
    {
      id: 3,
      type: 'tip',
      title: 'Transportation Budget Alert',
      message: 'You\'re close to exceeding your transportation budget. Consider carpooling or public transport.',
      confidence: 78
    }
  ];
}

function generateMockBudgetRecommendations() {
  return [
    {
      id: 1,
      category: 'Shopping',
      action: 'Reduce non-essential purchases',
      potentialSavings: 50,
      difficulty: 'medium'
    },
    {
      id: 2,
      category: 'Entertainment',
      action: 'Look for free entertainment options',
      potentialSavings: 30,
      difficulty: 'easy'
    },
    {
      id: 3,
      category: 'Food & Dining',
      action: 'Cook more meals at home',
      potentialSavings: 100,
      difficulty: 'medium'
    }
  ];
}

function getDefaultBudgetCategories() {
  return [
    'Food & Dining',
    'Transportation',
    'Entertainment',
    'Shopping',
    'Utilities',
    'Healthcare',
    'Education',
    'Housing',
    'Insurance',
    'Investments',
    'Other'
  ];
}

export default budgetService; 