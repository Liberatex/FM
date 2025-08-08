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

export const goalService = {
  // Get goals with optional filter
  async getGoals(filter = 'all') {
    try {
      const response = await api.get(`/financial/goals?filter=${filter}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching goals:', error);
      // Return mock data if API is not available
      return generateMockGoalsData(filter);
    }
  },

  // Create new goal
  async createGoal(goalData) {
    try {
      const response = await api.post('/financial/goals', goalData);
      return response.data;
    } catch (error) {
      console.error('Error creating goal:', error);
      throw new Error(error.response?.data?.message || 'Failed to create goal');
    }
  },

  // Update goal
  async updateGoal(goalId, goalData) {
    try {
      const response = await api.put(`/financial/goals/${goalId}`, goalData);
      return response.data;
    } catch (error) {
      console.error('Error updating goal:', error);
      throw new Error(error.response?.data?.message || 'Failed to update goal');
    }
  },

  // Delete goal
  async deleteGoal(goalId) {
    try {
      const response = await api.delete(`/financial/goals/${goalId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting goal:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete goal');
    }
  },

  // Get goal by ID
  async getGoal(goalId) {
    try {
      const response = await api.get(`/financial/goals/${goalId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching goal:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch goal');
    }
  },

  // Update goal progress
  async updateGoalProgress(goalId, progress) {
    try {
      const response = await api.post(`/financial/goals/${goalId}/progress`, { progress });
      return response.data;
    } catch (error) {
      console.error('Error updating goal progress:', error);
      throw new Error(error.response?.data?.message || 'Failed to update goal progress');
    }
  },

  // Get goal recommendations
  async getGoalRecommendations(userProfile) {
    try {
      const response = await api.post('/ai/goal-recommendations', { userProfile });
      return response.data.recommendations || [];
    } catch (error) {
      console.error('Error fetching goal recommendations:', error);
      return generateMockGoalRecommendations();
    }
  },

  // Export goals
  async exportGoals(filter = 'all', format = 'csv') {
    try {
      const response = await api.get(`/financial/goals/export?filter=${filter}&format=${format}`, {
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `goals-${filter}-${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('Error exporting goals:', error);
      throw new Error(error.response?.data?.message || 'Failed to export goals');
    }
  },

  // Get goal statistics
  async getGoalStats() {
    try {
      const response = await api.get('/financial/goals/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching goal stats:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch goal statistics');
    }
  },

  // Get goal categories
  async getGoalCategories() {
    try {
      const response = await api.get('/financial/goals/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching goal categories:', error);
      return getDefaultGoalCategories();
    }
  },

  // Get goal insights
  async getGoalInsights() {
    try {
      const response = await api.get('/financial/goals/insights');
      return response.data.insights || [];
    } catch (error) {
      console.error('Error fetching goal insights:', error);
      return generateMockGoalInsights();
    }
  },

  // Mark goal as completed
  async completeGoal(goalId) {
    try {
      const response = await api.post(`/financial/goals/${goalId}/complete`);
      return response.data;
    } catch (error) {
      console.error('Error completing goal:', error);
      throw new Error(error.response?.data?.message || 'Failed to complete goal');
    }
  },

  // Get goal milestones
  async getGoalMilestones(goalId) {
    try {
      const response = await api.get(`/financial/goals/${goalId}/milestones`);
      return response.data.milestones || [];
    } catch (error) {
      console.error('Error fetching goal milestones:', error);
      return [];
    }
  }
};

// Helper functions
function generateMockGoalsData(filter) {
  const goals = [
    {
      id: 1,
      title: 'Emergency Fund',
      description: 'Save 6 months of living expenses',
      targetAmount: 15000,
      currentAmount: 8500,
      progress: 56.7,
      category: 'Savings',
      type: 'long-term',
      status: 'active',
      deadline: '2024-12-31',
      createdAt: '2024-01-01',
      priority: 'high'
    },
    {
      id: 2,
      title: 'Vacation Fund',
      description: 'Save for summer vacation to Europe',
      targetAmount: 5000,
      currentAmount: 3200,
      progress: 64,
      category: 'Travel',
      type: 'short-term',
      status: 'active',
      deadline: '2024-06-30',
      createdAt: '2024-01-15',
      priority: 'medium'
    },
    {
      id: 3,
      title: 'Down Payment',
      description: 'Save for house down payment',
      targetAmount: 50000,
      currentAmount: 18000,
      progress: 36,
      category: 'Housing',
      type: 'long-term',
      status: 'active',
      deadline: '2025-12-31',
      createdAt: '2023-06-01',
      priority: 'high'
    },
    {
      id: 4,
      title: 'Car Purchase',
      description: 'Save for a new car',
      targetAmount: 25000,
      currentAmount: 25000,
      progress: 100,
      category: 'Transportation',
      type: 'medium-term',
      status: 'completed',
      deadline: '2024-03-31',
      createdAt: '2023-09-01',
      priority: 'medium'
    },
    {
      id: 5,
      title: 'Student Loan Payoff',
      description: 'Pay off remaining student loans',
      targetAmount: 12000,
      currentAmount: 8000,
      progress: 66.7,
      category: 'Debt',
      type: 'long-term',
      status: 'active',
      deadline: '2025-06-30',
      createdAt: '2023-12-01',
      priority: 'high'
    }
  ];

  // Filter goals based on filter parameter
  let filteredGoals = goals;
  if (filter === 'active') {
    filteredGoals = goals.filter(goal => goal.status === 'active');
  } else if (filter === 'completed') {
    filteredGoals = goals.filter(goal => goal.status === 'completed');
  } else if (filter === 'overdue') {
    filteredGoals = goals.filter(goal => new Date(goal.deadline) < new Date() && goal.status === 'active');
  } else if (filter === 'short-term') {
    filteredGoals = goals.filter(goal => goal.type === 'short-term');
  } else if (filter === 'long-term') {
    filteredGoals = goals.filter(goal => goal.type === 'long-term');
  }

  const totalGoals = goals.length;
  const completedGoals = goals.filter(goal => goal.status === 'completed').length;
  const activeGoals = goals.filter(goal => goal.status === 'active').length;

  return {
    goals: filteredGoals,
    totalGoals,
    completedGoals,
    activeGoals,
    insights: generateMockGoalInsights(),
    recommendations: generateMockGoalRecommendations(),
    progressStats: generateMockProgressStats()
  };
}

function generateMockGoalInsights() {
  return [
    {
      id: 1,
      type: 'positive',
      title: 'Great Progress on Emergency Fund',
      message: 'You\'re 56.7% towards your emergency fund goal. Keep up the consistent saving!',
      confidence: 92
    },
    {
      id: 2,
      type: 'warning',
      title: 'Vacation Goal Deadline Approaching',
      message: 'Your vacation fund is 64% complete with 3 months remaining. Consider increasing your monthly contribution.',
      confidence: 85
    },
    {
      id: 3,
      type: 'achievement',
      title: 'Car Purchase Goal Completed!',
      message: 'Congratulations! You\'ve successfully saved for your car purchase. Consider setting a new goal.',
      confidence: 100
    }
  ];
}

function generateMockGoalRecommendations() {
  return [
    {
      id: 1,
      title: 'Increase Emergency Fund Contributions',
      description: 'Consider increasing your monthly emergency fund contribution to reach your goal faster',
      potentialImpact: 'high',
      difficulty: 'medium'
    },
    {
      id: 2,
      title: 'Set Up Automatic Transfers',
      description: 'Automate your savings to ensure consistent progress towards your goals',
      potentialImpact: 'medium',
      difficulty: 'easy'
    },
    {
      id: 3,
      title: 'Review and Adjust Goals',
      description: 'Regularly review your goals and adjust timelines or amounts as needed',
      potentialImpact: 'medium',
      difficulty: 'easy'
    }
  ];
}

function generateMockProgressStats() {
  return {
    averageProgress: 64.7,
    completionRate: 20,
    averageTimeToComplete: 8.5,
    mostSuccessfulCategory: 'Transportation',
    mostChallengingCategory: 'Housing'
  };
}

function getDefaultGoalCategories() {
  return [
    'Savings',
    'Debt',
    'Housing',
    'Transportation',
    'Travel',
    'Education',
    'Investment',
    'Emergency Fund',
    'Retirement',
    'Other'
  ];
}

export default goalService; 