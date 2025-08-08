import { useState, useEffect } from 'react';

export const useFinancialData = () => {
  const [financialData, setFinancialData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Simulate loading financial data
    const loadData = async () => {
      try {
        setIsLoading(true);
        // In a real app, this would fetch from API
        const mockData = {
          netWorth: 75000,
          monthlyIncome: 6250,
          monthlyExpenses: 4500,
          savingsRate: 15
        };
        
        setTimeout(() => {
          setFinancialData(mockData);
          setIsLoading(false);
        }, 1000);
      } catch (err) {
        setError(err);
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  return { financialData, isLoading, error };
}; 