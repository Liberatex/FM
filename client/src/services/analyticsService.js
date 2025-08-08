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

export const analyticsService = {
  async getAnalyticsData(period = '1y', metric = 'all') {
    try {
      const response = await api.get(`/analytics?period=${period}&metric=${metric}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
      return generateMockAnalyticsData(period, metric);
    }
  },

  async getSpendingAnalysis(period = '1y') {
    try {
      const response = await api.get(`/analytics/spending?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch spending analysis:', error);
      return generateMockSpendingAnalysis(period);
    }
  },

  async getIncomeAnalysis(period = '1y') {
    try {
      const response = await api.get(`/analytics/income?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch income analysis:', error);
      return generateMockIncomeAnalysis(period);
    }
  },

  async getSavingsAnalysis(period = '1y') {
    try {
      const response = await api.get(`/analytics/savings?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch savings analysis:', error);
      return generateMockSavingsAnalysis(period);
    }
  },

  async getInvestmentAnalysis(period = '1y') {
    try {
      const response = await api.get(`/analytics/investments?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch investment analysis:', error);
      return generateMockInvestmentAnalysis(period);
    }
  },

  async exportReport(period = '1y', format = 'pdf') {
    try {
      const response = await api.get(`/analytics/export?period=${period}&format=${format}`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Failed to export report:', error);
      throw error;
    }
  }
};

// Mock data generators
function generateMockAnalyticsData(period, metric) {
  return {
    totalSpending: 52000,
    totalIncome: 85000,
    savingsRate: 0.388,
    investmentReturn: 0.076,
    topSpendingCategories: [
      { name: 'Food & Dining', amount: 8500, percentage: 16.3 },
      { name: 'Transportation', amount: 6500, percentage: 12.5 },
      { name: 'Shopping', amount: 5200, percentage: 10.0 },
      { name: 'Entertainment', amount: 4000, percentage: 7.7 },
      { name: 'Utilities', amount: 3800, percentage: 7.3 }
    ],
    spendingTrends: generateMockTrends(period),
    incomeTrends: generateMockIncomeTrends(period),
    savingsTrends: generateMockSavingsTrends(period),
    investmentTrends: generateMockInvestmentTrends(period),
    financialHealthScore: 85,
    debtToIncomeRatio: 0.15,
    emergencyFundRatio: 0.8,
    investmentDiversificationScore: 78
  };
}

function generateMockSpendingAnalysis(period) {
  return {
    totalSpending: 52000,
    averageMonthlySpending: 4333,
    spendingByCategory: [
      { category: 'Food & Dining', amount: 8500, percentage: 16.3 },
      { category: 'Transportation', amount: 6500, percentage: 12.5 },
      { category: 'Shopping', amount: 5200, percentage: 10.0 },
      { category: 'Entertainment', amount: 4000, percentage: 7.7 },
      { category: 'Utilities', amount: 3800, percentage: 7.3 }
    ],
    spendingTrends: generateMockTrends(period),
    topSpendingDays: [
      { day: 'Friday', amount: 8500, percentage: 16.3 },
      { day: 'Saturday', amount: 7800, percentage: 15.0 },
      { day: 'Sunday', amount: 6500, percentage: 12.5 }
    ]
  };
}

function generateMockIncomeAnalysis(period) {
  return {
    totalIncome: 85000,
    averageMonthlyIncome: 7083,
    incomeBySource: [
      { source: 'Salary', amount: 72000, percentage: 84.7 },
      { source: 'Freelance', amount: 8000, percentage: 9.4 },
      { source: 'Investments', amount: 3200, percentage: 3.8 },
      { source: 'Other', amount: 1800, percentage: 2.1 }
    ],
    incomeTrends: generateMockIncomeTrends(period),
    incomeGrowth: 0.08
  };
}

function generateMockSavingsAnalysis(period) {
  return {
    totalSavings: 33000,
    savingsRate: 0.388,
    savingsByGoal: [
      { goal: 'Emergency Fund', amount: 8000, percentage: 24.2 },
      { goal: 'Vacation', amount: 2500, percentage: 7.6 },
      { goal: 'Home Down Payment', amount: 15000, percentage: 45.5 },
      { goal: 'Retirement', amount: 7500, percentage: 22.7 }
    ],
    savingsTrends: generateMockSavingsTrends(period),
    savingsGrowth: 0.12
  };
}

function generateMockInvestmentAnalysis(period) {
  return {
    totalValue: 45000,
    totalGain: 3200,
    gainPercentage: 7.6,
    assetAllocation: [
      { asset: 'Stocks', value: 25000, percentage: 55.6 },
      { asset: 'Bonds', value: 12000, percentage: 26.7 },
      { asset: 'Real Estate', value: 5000, percentage: 11.1 },
      { asset: 'Cash', value: 3000, percentage: 6.7 }
    ],
    investmentTrends: generateMockInvestmentTrends(period),
    riskScore: 65,
    diversificationScore: 78
  };
}

function generateMockTrends(period) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months.map((month, index) => ({
    month,
    amount: 4000 + Math.random() * 2000,
    percentage: 15 + Math.random() * 10
  }));
}

function generateMockIncomeTrends(period) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months.map((month, index) => ({
    month,
    amount: 7000 + Math.random() * 1000,
    percentage: 80 + Math.random() * 10
  }));
}

function generateMockSavingsTrends(period) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months.map((month, index) => ({
    month,
    amount: 2500 + Math.random() * 1000,
    percentage: 30 + Math.random() * 15
  }));
}

function generateMockInvestmentTrends(period) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months.map((month, index) => ({
    month,
    value: 42000 + (index * 500) + Math.random() * 1000,
    gain: 2 + Math.random() * 4
  }));
}

export default analyticsService; 