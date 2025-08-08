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

export const transactionService = {
  // Get transactions with filters
  async getTransactions({ filters = {}, sortBy = 'date', sortOrder = 'desc', search = '', page = 1, limit = 20 }) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
        ...filters
      });

      if (search) {
        params.append('search', search);
      }

      const response = await api.get(`/financial/transactions?${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch transactions');
    }
  },

  // Create new transaction
  async createTransaction(transactionData) {
    try {
      const response = await api.post('/financial/transactions', transactionData);
      return response.data;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw new Error(error.response?.data?.message || 'Failed to create transaction');
    }
  },

  // Update transaction
  async updateTransaction(transactionId, transactionData) {
    try {
      const response = await api.put(`/financial/transactions/${transactionId}`, transactionData);
      return response.data;
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw new Error(error.response?.data?.message || 'Failed to update transaction');
    }
  },

  // Delete transaction
  async deleteTransaction(transactionId) {
    try {
      const response = await api.delete(`/financial/transactions/${transactionId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete transaction');
    }
  },

  // Get transaction by ID
  async getTransaction(transactionId) {
    try {
      const response = await api.get(`/financial/transactions/${transactionId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching transaction:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch transaction');
    }
  },

  // Get AI suggestions for transaction
  async getAiSuggestions(description) {
    try {
      const response = await api.post('/ai/suggest-transaction', { description });
      return response.data.suggestions || [];
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
      // Return mock suggestions if AI service is not available
      return generateMockSuggestions(description);
    }
  },

  // Export transactions
  async exportTransactions({ filters = {}, sortBy = 'date', sortOrder = 'desc', search = '', format = 'csv' }) {
    try {
      const params = new URLSearchParams({
        format,
        sortBy,
        sortOrder,
        ...filters
      });

      if (search) {
        params.append('search', search);
      }

      const response = await api.get(`/financial/transactions/export?${params}`, {
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `transactions-${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('Error exporting transactions:', error);
      throw new Error(error.response?.data?.message || 'Failed to export transactions');
    }
  },

  // Get transaction statistics
  async getTransactionStats(period = '30d') {
    try {
      const response = await api.get(`/financial/transactions/stats?period=${period}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching transaction stats:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch transaction statistics');
    }
  },

  // Bulk import transactions
  async bulkImportTransactions(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/financial/transactions/bulk-import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error importing transactions:', error);
      throw new Error(error.response?.data?.message || 'Failed to import transactions');
    }
  },

  // Get transaction categories
  async getTransactionCategories() {
    try {
      const response = await api.get('/financial/transactions/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Return default categories if API fails
      return getDefaultCategories();
    }
  },

  // Get transaction templates
  async getTransactionTemplates() {
    try {
      const response = await api.get('/financial/transactions/templates');
      return response.data;
    } catch (error) {
      console.error('Error fetching templates:', error);
      return [];
    }
  },

  // Save transaction template
  async saveTransactionTemplate(templateData) {
    try {
      const response = await api.post('/financial/transactions/templates', templateData);
      return response.data;
    } catch (error) {
      console.error('Error saving template:', error);
      throw new Error(error.response?.data?.message || 'Failed to save template');
    }
  }
};

// Helper functions
function generateMockSuggestions(description) {
  const suggestions = [];
  const lowerDescription = description.toLowerCase();

  // Food & Dining
  if (lowerDescription.includes('restaurant') || lowerDescription.includes('food') || lowerDescription.includes('dining')) {
    suggestions.push({
      category: 'Food & Dining',
      type: 'expense',
      confidence: 95
    });
  }

  // Transportation
  if (lowerDescription.includes('uber') || lowerDescription.includes('lyft') || lowerDescription.includes('taxi') || lowerDescription.includes('gas')) {
    suggestions.push({
      category: 'Transportation',
      type: 'expense',
      confidence: 90
    });
  }

  // Shopping
  if (lowerDescription.includes('amazon') || lowerDescription.includes('walmart') || lowerDescription.includes('target') || lowerDescription.includes('shop')) {
    suggestions.push({
      category: 'Shopping',
      type: 'expense',
      confidence: 85
    });
  }

  // Entertainment
  if (lowerDescription.includes('netflix') || lowerDescription.includes('spotify') || lowerDescription.includes('movie') || lowerDescription.includes('game')) {
    suggestions.push({
      category: 'Entertainment',
      type: 'expense',
      confidence: 80
    });
  }

  // Salary
  if (lowerDescription.includes('salary') || lowerDescription.includes('payroll') || lowerDescription.includes('income')) {
    suggestions.push({
      category: 'Salary',
      type: 'income',
      confidence: 95
    });
  }

  // Default suggestion if no matches
  if (suggestions.length === 0) {
    suggestions.push({
      category: 'Other',
      type: 'expense',
      confidence: 50
    });
  }

  return suggestions;
}

function getDefaultCategories() {
  return [
    'Food & Dining',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Healthcare',
    'Education',
    'Housing',
    'Utilities',
    'Insurance',
    'Investments',
    'Salary',
    'Freelance',
    'Business',
    'Other'
  ];
}

export default transactionService; 