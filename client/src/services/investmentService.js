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

export const investmentService = {
  // Get investment data for a specific period
  async getInvestmentData(period = '1y') {
    try {
      const response = await api.get(`/financial/investments?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching investment data:', error);
      // Return mock data if API is not available
      return generateMockInvestmentData(period);
    }
  },

  // Create new investment
  async createInvestment(investmentData) {
    try {
      const response = await api.post('/financial/investments', investmentData);
      return response.data;
    } catch (error) {
      console.error('Error creating investment:', error);
      throw new Error(error.response?.data?.message || 'Failed to create investment');
    }
  },

  // Update investment
  async updateInvestment(investmentId, investmentData) {
    try {
      const response = await api.put(`/financial/investments/${investmentId}`, investmentData);
      return response.data;
    } catch (error) {
      console.error('Error updating investment:', error);
      throw new Error(error.response?.data?.message || 'Failed to update investment');
    }
  },

  // Delete investment
  async deleteInvestment(investmentId) {
    try {
      const response = await api.delete(`/financial/investments/${investmentId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting investment:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete investment');
    }
  },

  // Get investment by ID
  async getInvestment(investmentId) {
    try {
      const response = await api.get(`/financial/investments/${investmentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching investment:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch investment');
    }
  },

  // Get investment performance
  async getInvestmentPerformance(investmentId, period = '1y') {
    try {
      const response = await api.get(`/financial/investments/${investmentId}/performance?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching investment performance:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch investment performance');
    }
  },

  // Get investment recommendations
  async getInvestmentRecommendations(userProfile) {
    try {
      const response = await api.post('/ai/investment-recommendations', { userProfile });
      return response.data.recommendations || [];
    } catch (error) {
      console.error('Error fetching investment recommendations:', error);
      return generateMockInvestmentRecommendations();
    }
  },

  // Export investments
  async exportInvestments(period = '1y', format = 'csv') {
    try {
      const response = await api.get(`/financial/investments/export?period=${period}&format=${format}`, {
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `investments-${period}-${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('Error exporting investments:', error);
      throw new Error(error.response?.data?.message || 'Failed to export investments');
    }
  },

  // Get investment statistics
  async getInvestmentStats(period = '1y') {
    try {
      const response = await api.get(`/financial/investments/stats?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching investment stats:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch investment statistics');
    }
  },

  // Get investment categories
  async getInvestmentCategories() {
    try {
      const response = await api.get('/financial/investments/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching investment categories:', error);
      return getDefaultInvestmentCategories();
    }
  },

  // Get investment insights
  async getInvestmentInsights(period = '1y') {
    try {
      const response = await api.get(`/financial/investments/insights?period=${period}`);
      return response.data.insights || [];
    } catch (error) {
      console.error('Error fetching investment insights:', error);
      return generateMockInvestmentInsights();
    }
  },

  // Get portfolio rebalancing suggestions
  async getRebalancingSuggestions() {
    try {
      const response = await api.get('/financial/investments/rebalancing');
      return response.data.suggestions || [];
    } catch (error) {
      console.error('Error fetching rebalancing suggestions:', error);
      return [];
    }
  },

  // Get risk assessment
  async getRiskAssessment() {
    try {
      const response = await api.get('/financial/investments/risk-assessment');
      return response.data;
    } catch (error) {
      console.error('Error fetching risk assessment:', error);
      return generateMockRiskAssessment();
    }
  }
};

// Helper functions
function generateMockInvestmentData(period) {
  const portfolio = [
    {
      id: 1,
      name: 'Apple Inc. (AAPL)',
      symbol: 'AAPL',
      type: 'Stock',
      quantity: 50,
      averagePrice: 150.00,
      currentPrice: 175.50,
      currentValue: 8775,
      totalGain: 1275,
      gainPercentage: 17.0,
      category: 'Technology'
    },
    {
      id: 2,
      name: 'Vanguard S&P 500 ETF',
      symbol: 'VOO',
      type: 'ETF',
      quantity: 25,
      averagePrice: 350.00,
      currentPrice: 385.20,
      currentValue: 9630,
      totalGain: 880,
      gainPercentage: 10.1,
      category: 'Index Fund'
    },
    {
      id: 3,
      name: 'Tesla Inc. (TSLA)',
      symbol: 'TSLA',
      type: 'Stock',
      quantity: 20,
      averagePrice: 200.00,
      currentPrice: 180.00,
      currentValue: 3600,
      totalGain: -400,
      gainPercentage: -10.0,
      category: 'Automotive'
    },
    {
      id: 4,
      name: 'Microsoft Corp. (MSFT)',
      symbol: 'MSFT',
      type: 'Stock',
      quantity: 30,
      averagePrice: 280.00,
      currentPrice: 320.00,
      currentValue: 9600,
      totalGain: 1200,
      gainPercentage: 14.3,
      category: 'Technology'
    },
    {
      id: 5,
      name: 'iShares Core U.S. Aggregate Bond ETF',
      symbol: 'AGG',
      type: 'ETF',
      quantity: 100,
      averagePrice: 110.00,
      currentPrice: 108.50,
      currentValue: 10850,
      totalGain: -150,
      gainPercentage: -1.4,
      category: 'Bonds'
    }
  ];

  const totalValue = portfolio.reduce((sum, inv) => sum + inv.currentValue, 0);
  const totalGain = portfolio.reduce((sum, inv) => sum + inv.totalGain, 0);
  const totalGainPercentage = totalValue > 0 ? (totalGain / (totalValue - totalGain)) * 100 : 0;

  const assetAllocation = {
    'Technology': 45.2,
    'Index Fund': 23.1,
    'Automotive': 8.6,
    'Bonds': 23.1
  };

  const performance = generateMockPerformance(period);

  return {
    totalValue,
    totalGain,
    totalGainPercentage,
    portfolio,
    performance,
    assetAllocation,
    insights: generateMockInvestmentInsights(),
    recommendations: generateMockInvestmentRecommendations(),
    riskMetrics: generateMockRiskAssessment()
  };
}

function generateMockPerformance(period) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const performance = [];
  
  let baseValue = 35000;
  for (let i = 0; i < 12; i++) {
    const change = (Math.random() - 0.5) * 0.1; // ±5% monthly change
    baseValue *= (1 + change);
    performance.push({
      month: months[i],
      value: baseValue,
      change: change * 100
    });
  }
  
  return performance;
}

function generateMockInvestmentInsights() {
  return [
    {
      id: 1,
      type: 'positive',
      title: 'Strong Technology Performance',
      message: 'Your technology holdings are performing well with a 15.7% average return.',
      confidence: 88
    },
    {
      id: 2,
      type: 'warning',
      title: 'Tesla Position Underperforming',
      message: 'Your Tesla position is down 10%. Consider reviewing your position or averaging down.',
      confidence: 92
    },
    {
      id: 3,
      type: 'tip',
      title: 'Portfolio Diversification',
      message: 'Consider adding more international exposure to improve diversification.',
      confidence: 75
    }
  ];
}

function generateMockInvestmentRecommendations() {
  return [
    {
      id: 1,
      title: 'Consider Averaging Down on Tesla',
      description: 'Tesla is trading below your average cost. Consider adding to your position.',
      risk: 'medium',
      potentialReturn: 'high'
    },
    {
      id: 2,
      title: 'Add International Exposure',
      description: 'Consider adding international ETFs to improve portfolio diversification.',
      risk: 'low',
      potentialReturn: 'medium'
    },
    {
      id: 3,
      title: 'Rebalance Portfolio',
      description: 'Your technology allocation is overweight. Consider rebalancing.',
      risk: 'low',
      potentialReturn: 'medium'
    }
  ];
}

function generateMockRiskAssessment() {
  return {
    riskScore: 7.2,
    riskLevel: 'Moderate',
    diversificationScore: 65,
    volatilityIndex: 12.5,
    sharpeRatio: 1.2,
    maxDrawdown: -8.5
  };
}

function getDefaultInvestmentCategories() {
  return [
    'Technology',
    'Healthcare',
    'Financial',
    'Consumer',
    'Energy',
    'Industrial',
    'Materials',
    'Utilities',
    'Real Estate',
    'Bonds',
    'Index Fund',
    'International',
    'Other'
  ];
}

export default investmentService; 