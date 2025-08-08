import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PiggyBank, 
  CreditCard, 
  Target,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { formatCurrency, formatPercentage } from '../../../utils/formatters';

const FinancialOverview = ({ data }) => {
  const {
    totalBalance,
    monthlyIncome,
    monthlyExpenses,
    savingsRate,
    netWorth,
    monthlyChange,
    changePercentage
  } = data || {};

  const cards = [
    {
      title: 'Total Balance',
      value: totalBalance,
      change: monthlyChange,
      changePercentage: changePercentage,
      icon: DollarSign,
      color: 'blue',
      trend: changePercentage >= 0 ? 'up' : 'down'
    },
    {
      title: 'Monthly Income',
      value: monthlyIncome,
      icon: TrendingUp,
      color: 'green',
      trend: 'up'
    },
    {
      title: 'Monthly Expenses',
      value: monthlyExpenses,
      icon: CreditCard,
      color: 'red',
      trend: 'down'
    },
    {
      title: 'Savings Rate',
      value: savingsRate,
      icon: PiggyBank,
      color: 'purple',
      trend: 'up',
      isPercentage: true
    }
  ];

  const getColorClasses = (color, trend) => {
    const colorMap = {
      blue: {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-200 dark:border-blue-800',
        text: 'text-blue-600 dark:text-blue-400',
        icon: 'text-blue-500'
      },
      green: {
        bg: 'bg-green-50 dark:bg-green-900/20',
        border: 'border-green-200 dark:border-green-800',
        text: 'text-green-600 dark:text-green-400',
        icon: 'text-green-500'
      },
      red: {
        bg: 'bg-red-50 dark:bg-red-900/20',
        border: 'border-red-200 dark:border-red-800',
        text: 'text-red-600 dark:text-red-400',
        icon: 'text-red-500'
      },
      purple: {
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        border: 'border-purple-200 dark:border-purple-800',
        text: 'text-purple-600 dark:text-purple-400',
        icon: 'text-purple-500'
      }
    };

    return colorMap[color] || colorMap.blue;
  };

  const getTrendIcon = (trend) => {
    return trend === 'up' ? (
      <ArrowUpRight className="w-4 h-4 text-green-500" />
    ) : (
      <ArrowDownRight className="w-4 h-4 text-red-500" />
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Financial Overview
        </h2>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <span>Last updated:</span>
          <span>{new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => {
          const colors = getColorClasses(card.color, card.trend);
          const IconComponent = card.icon;

          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-6 rounded-lg border ${colors.bg} ${colors.border}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${colors.bg}`}>
                  <IconComponent className={`w-6 h-6 ${colors.icon}`} />
                </div>
                {card.change !== undefined && (
                  <div className="flex items-center gap-1">
                    {getTrendIcon(card.trend)}
                    <span className={`text-sm font-medium ${colors.text}`}>
                      {card.changePercentage >= 0 ? '+' : ''}{formatPercentage(card.changePercentage / 100)}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  {card.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {card.isPercentage 
                    ? formatPercentage(card.value / 100)
                    : formatCurrency(card.value)
                  }
                </p>
                {card.change !== undefined && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {card.change >= 0 ? '+' : ''}{formatCurrency(card.change)} this month
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Net Worth Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">Net Worth</h3>
            <p className="text-3xl font-bold">{formatCurrency(netWorth)}</p>
            <p className="text-blue-100 text-sm mt-1">
              Total assets minus liabilities
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 mb-2">
              {getTrendIcon(changePercentage >= 0 ? 'up' : 'down')}
              <span className="text-lg font-semibold">
                {changePercentage >= 0 ? '+' : ''}{formatPercentage(changePercentage / 100)}
              </span>
            </div>
            <p className="text-blue-100 text-sm">
              {monthlyChange >= 0 ? '+' : ''}{formatCurrency(monthlyChange)} this month
            </p>
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Income Trend</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                +{formatPercentage(0.12)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Expense Trend</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                -{formatPercentage(0.05)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Goal Progress</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatPercentage(0.65)}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FinancialOverview; 