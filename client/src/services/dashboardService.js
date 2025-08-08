import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
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

export const dashboardService = {
  async getDashboardData() {
    try {
      const response = await api.get('/dashboard');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      return generateMockDashboardData();
    }
  },

  async getFinancialOverview() {
    try {
      const response = await api.get('/dashboard/financial-overview');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch financial overview:', error);
      return generateMockFinancialOverview();
    }
  },

  async getRecentTransactions(limit = 5) {
    try {
      const response = await api.get(`/dashboard/recent-transactions?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch recent transactions:', error);
      return generateMockRecentTransactions(limit);
    }
  },

  async getSpendingInsights() {
    try {
      const response = await api.get('/dashboard/spending-insights');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch spending insights:', error);
      return generateMockSpendingInsights();
    }
  },

  async getGoalProgress() {
    try {
      const response = await api.get('/dashboard/goal-progress');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch goal progress:', error);
      return generateMockGoalProgress();
    }
  },

  async getInvestmentSummary() {
    try {
      const response = await api.get('/dashboard/investment-summary');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch investment summary:', error);
      return generateMockInvestmentSummary();
    }
  },

  async getQuickActions() {
    try {
      const response = await api.get('/dashboard/quick-actions');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch quick actions:', error);
      return generateMockQuickActions();
    }
  },

  async getNotifications() {
    try {
      const response = await api.get('/dashboard/notifications');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      return generateMockNotifications();
    }
  }
};

// Mock data generators
function generateMockDashboardData() {
  return {
    financialOverview: generateMockFinancialOverview(),
    recentTransactions: generateMockRecentTransactions(5),
    spendingInsights: generateMockSpendingInsights(),
    goalProgress: generateMockGoalProgress(),
    investmentSummary: generateMockInvestmentSummary(),
    quickActions: generateMockQuickActions(),
    notifications: generateMockNotifications()
  };
}

function generateMockFinancialOverview() {
  return {
    totalBalance: 125000,
    monthlyIncome: 8500,
    monthlyExpenses: 5200,
    savingsRate: 38.8,
    netWorth: 185000,
    monthlyChange: 3200,
    changePercentage: 2.8
  };
}

function generateMockRecentTransactions(limit) {
  const transactions = [
    {
      id: 1,
      description: 'Grocery Store',
      amount: -85.50,
      category: 'Food & Dining',
      date: new Date().toISOString(),
      type: 'expense'
    },
    {
      id: 2,
      description: 'Salary Deposit',
      amount: 8500.00,
      category: 'Income',
      date: new Date(Date.now() - 86400000).toISOString(),
      type: 'income'
    },
    {
      id: 3,
      description: 'Gas Station',
      amount: -45.00,
      category: 'Transportation',
      date: new Date(Date.now() - 172800000).toISOString(),
      type: 'expense'
    },
    {
      id: 4,
      description: 'Online Purchase',
      amount: -120.00,
      category: 'Shopping',
      date: new Date(Date.now() - 259200000).toISOString(),
      type: 'expense'
    },
    {
      id: 5,
      description: 'Freelance Payment',
      amount: 500.00,
      category: 'Income',
      date: new Date(Date.now() - 345600000).toISOString(),
      type: 'income'
    }
  ];

  return transactions.slice(0, limit);
}

function generateMockSpendingInsights() {
  return {
    topCategories: [
      { category: 'Food & Dining', amount: 850, percentage: 16.3 },
      { category: 'Transportation', amount: 650, percentage: 12.5 },
      { category: 'Shopping', amount: 520, percentage: 10.0 },
      { category: 'Entertainment', amount: 400, percentage: 7.7 },
      { category: 'Utilities', amount: 380, percentage: 7.3 }
    ],
    spendingTrend: 'increasing',
    averageDailySpending: 173,
    budgetUtilization: 78.5
  };
}

function generateMockGoalProgress() {
  return [
    {
      id: 1,
      name: 'Emergency Fund',
      currentAmount: 8000,
      targetAmount: 10000,
      progress: 80,
      targetDate: '2024-06-01'
    },
    {
      id: 2,
      name: 'Vacation Fund',
      currentAmount: 2500,
      targetAmount: 5000,
      progress: 50,
      targetDate: '2024-08-15'
    },
    {
      id: 3,
      name: 'Home Down Payment',
      currentAmount: 15000,
      targetAmount: 50000,
      progress: 30,
      targetDate: '2025-12-01'
    }
  ];
}

function generateMockInvestmentSummary() {
  return {
    totalValue: 45000,
    totalGain: 3200,
    gainPercentage: 7.6,
    monthlyChange: 850,
    topPerformers: [
      { name: 'AAPL', gain: 12.5 },
      { name: 'TSLA', gain: 8.3 },
      { name: 'MSFT', gain: 6.7 }
    ],
    riskScore: 65,
    diversificationScore: 78
  };
}

function generateMockQuickActions() {
  return [
    {
      id: 1,
      title: 'Add Transaction',
      description: 'Record a new transaction',
      icon: 'Plus',
      action: 'add-transaction',
      color: 'blue'
    },
    {
      id: 2,
      title: 'Set Budget',
      description: 'Create a new budget',
      icon: 'Target',
      action: 'set-budget',
      color: 'green'
    },
    {
      id: 3,
      title: 'Add Goal',
      description: 'Create a financial goal',
      icon: 'Flag',
      action: 'add-goal',
      color: 'purple'
    },
    {
      id: 4,
      title: 'Investment',
      description: 'Add investment',
      icon: 'TrendingUp',
      action: 'add-investment',
      color: 'orange'
    }
  ];
}

function generateMockNotifications() {
  return [
    {
      id: 1,
      type: 'warning',
      title: 'Budget Alert',
      message: 'You\'re approaching your dining budget limit',
      timestamp: new Date().toISOString(),
      read: false
    },
    {
      id: 2,
      type: 'success',
      title: 'Goal Achieved',
      message: 'Congratulations! You\'ve reached 80% of your emergency fund goal',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      read: false
    },
    {
      id: 3,
      type: 'info',
      title: 'Investment Update',
      message: 'Your portfolio has gained 2.3% this week',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      read: true
    }
  ];
}

export default dashboardService; 