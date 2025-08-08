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
import { Target, Calendar, DollarSign, TrendingUp } from 'lucide-react';

// Utils
import { formatCurrency, formatPercentage } from '../../../utils/formatters';

const GoalChart = ({ goals, period }) => {
  const chartData = useMemo(() => {
    if (!goals || goals.length === 0) {
      return {
        progressByCategory: [],
        timelineData: [],
        pieData: [],
        summary: {
          totalGoals: 0,
          completedGoals: 0,
          activeGoals: 0,
          totalTarget: 0,
          totalCurrent: 0,
          averageProgress: 0
        }
      };
    }

    // Progress by category
    const categoryMap = {};
    goals.forEach(goal => {
      if (!categoryMap[goal.category]) {
        categoryMap[goal.category] = {
          name: goal.category,
          totalTarget: 0,
          totalCurrent: 0,
          count: 0
        };
      }
      categoryMap[goal.category].totalTarget += goal.targetAmount;
      categoryMap[goal.category].totalCurrent += goal.currentAmount;
      categoryMap[goal.category].count += 1;
    });

    const progressByCategory = Object.values(categoryMap).map(cat => ({
      name: cat.name,
      target: cat.totalTarget,
      current: cat.totalCurrent,
      progress: cat.totalTarget > 0 ? (cat.totalCurrent / cat.totalTarget) * 100 : 0,
      count: cat.count
    }));

    // Timeline data (monthly progress)
    const timelineData = generateTimelineData(goals);

    // Pie chart data (goal status distribution)
    const completedGoals = goals.filter(goal => goal.currentAmount >= goal.targetAmount);
    const activeGoals = goals.filter(goal => goal.currentAmount < goal.targetAmount);
    const overdueGoals = goals.filter(goal => {
      const daysRemaining = Math.ceil((new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24));
      return daysRemaining < 0 && goal.currentAmount < goal.targetAmount;
    });

    const pieData = [
      {
        name: 'Completed',
        value: completedGoals.length,
        color: '#10B981'
      },
      {
        name: 'Active',
        value: activeGoals.length - overdueGoals.length,
        color: '#3B82F6'
      },
      {
        name: 'Overdue',
        value: overdueGoals.length,
        color: '#EF4444'
      }
    ];

    // Summary statistics
    const totalGoals = goals.length;
    const totalTarget = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
    const totalCurrent = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
    const averageProgress = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;

    return {
      progressByCategory,
      timelineData,
      pieData,
      summary: {
        totalGoals,
        completedGoals: completedGoals.length,
        activeGoals: activeGoals.length,
        totalTarget,
        totalCurrent,
        averageProgress
      }
    };
  }, [goals, period]);

  const generateTimelineData = (goals) => {
    const months = [];
    const now = new Date();
    
    // Generate last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        target: 0,
        current: 0,
        completed: 0
      });
    }

    // Calculate monthly data
    goals.forEach(goal => {
      const goalDate = new Date(goal.targetDate);
      const monthIndex = months.findIndex(m => {
        const monthDate = new Date(m.month);
        return monthDate.getMonth() === goalDate.getMonth() && 
               monthDate.getFullYear() === goalDate.getFullYear();
      });

      if (monthIndex !== -1) {
        months[monthIndex].target += goal.targetAmount;
        months[monthIndex].current += Math.min(goal.currentAmount, goal.targetAmount);
        if (goal.currentAmount >= goal.targetAmount) {
          months[monthIndex].completed += 1;
        }
      }
    });

    return months;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.dataKey === 'progress' ? `${entry.value.toFixed(1)}%` : formatCurrency(entry.value)}
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

  if (!goals || goals.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Goal Analytics
        </h3>
        <div className="text-center py-8">
          <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            No goal data available for analysis
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Goal Analytics
      </h3>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Total Goals</span>
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {chartData.summary.totalGoals}
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Completed</span>
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {chartData.summary.completedGoals}
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-purple-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Total Target</span>
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {formatCurrency(chartData.summary.totalTarget)}
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-orange-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400">Progress</span>
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {formatPercentage(chartData.summary.averageProgress / 100)}
          </p>
        </div>
      </div>

      {/* Progress by Category Chart */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Progress by Category
        </h4>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData.progressByCategory}>
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
            <Bar dataKey="progress" fill="#3B82F6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Timeline Chart */}
      {chartData.timelineData.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Monthly Goal Progress
          </h4>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData.timelineData}>
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
                dataKey="target" 
                stroke="#10B981" 
                strokeWidth={2}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                name="Target"
              />
              <Line 
                type="monotone" 
                dataKey="current" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                name="Current"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Goal Status Distribution */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Goal Status Distribution
        </h4>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={chartData.pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
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

      {/* Additional Stats */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Completion Rate</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {chartData.summary.totalGoals > 0 
              ? formatPercentage(chartData.summary.completedGoals / chartData.summary.totalGoals)
              : '0%'
            }
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">Average Goal Value</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {chartData.summary.totalGoals > 0 
              ? formatCurrency(chartData.summary.totalTarget / chartData.summary.totalGoals)
              : '$0.00'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default GoalChart; 