import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';

// Utils
import { formatCurrency } from '../../../utils/formatters';

const BudgetChart = ({ categories, monthlyTrends, period }) => {
  const chartData = useMemo(() => {
    if (!categories || categories.length === 0) {
      return {
        spendingByCategory: [],
        monthlyTrends: [],
        pieData: []
      };
    }

    // Spending by category
    const spendingByCategory = categories.map(category => ({
      name: category.name,
      budget: category.budget,
      spent: category.spent,
      remaining: category.remaining,
      percentage: category.percentage
    }));

    // Monthly trends
    const trends = monthlyTrends || [];

    // Pie chart data
    const pieData = categories.map(category => ({
      name: category.name,
      value: category.spent,
      budget: category.budget,
      color: getCategoryColor(category.percentage)
    }));

    return {
      spendingByCategory,
      monthlyTrends: trends,
      pieData
    };
  }, [categories, monthlyTrends]);

  const getCategoryColor = (percentage) => {
    if (percentage > 100) return '#EF4444'; // Red for over budget
    if (percentage > 80) return '#F59E0B'; // Yellow for near limit
    return '#10B981'; // Green for on track
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const COLORS = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
    '#8B5CF6', '#06B6D4', '#F97316', '#84CC16'
  ];

  if (!categories || categories.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Budget Analytics
        </h3>
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            No budget data available for analysis
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Budget Analytics
      </h3>

      {/* Spending by Category Chart */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Spending by Category
        </h4>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData.spendingByCategory}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="name" 
              stroke="#6B7280"
              fontSize={11}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis stroke="#6B7280" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="spent" fill="#3B82F6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Trends Chart */}
      {chartData.monthlyTrends.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Monthly Budget vs Spending
          </h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData.monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="month" 
                stroke="#6B7280"
                fontSize={12}
              />
              <YAxis stroke="#6B7280" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="budget" 
                stroke="#10B981" 
                strokeWidth={2}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="spent" 
                stroke="#EF4444" 
                strokeWidth={2}
                dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Budget Distribution Pie Chart */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Budget Distribution
        </h4>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={chartData.pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Total Budget</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {formatCurrency(categories.reduce((sum, cat) => sum + cat.budget, 0))}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Total Spent</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {formatCurrency(categories.reduce((sum, cat) => sum + cat.spent, 0))}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BudgetChart; 