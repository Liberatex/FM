const logger = require('../utils/logger');
const { getRedisClient } = require('../config/redis');
const User = require('../models/User');
const FinancialTransaction = require('../models/FinancialTransaction');
const AIIntervention = require('../models/AIIntervention');
const AIService = require('./aiService');

class RealTimeService {
  constructor() {
    this.activeUsers = new Map();
    this.userSessions = new Map();
    this.activityQueue = [];
    this.isRunning = false;
    this.processingInterval = null;
  }

  start() {
    if (this.isRunning) {
      logger.warn('RealTimeService is already running');
      return;
    }

    this.isRunning = true;
    
    // Start processing queue
    this.processingInterval = setInterval(() => {
      this.processActivityQueue();
    }, 1000); // Process every second
    
    // Start periodic tasks
    this.startPeriodicTasks();
    
    logger.info('RealTimeService started successfully');
  }

  stop() {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;
    
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
    
    logger.info('RealTimeService stopped');
  }

  async trackUserActivity(userId, activityData) {
    try {
      const activity = {
        userId,
        timestamp: new Date(),
        ...activityData
      };

      // Add to processing queue
      this.activityQueue.push(activity);
      
      // Update active users
      this.activeUsers.set(userId, {
        lastActivity: new Date(),
        currentPage: activityData.page,
        sessionId: activityData.sessionId
      });

      // Store in Redis for real-time access
      const redis = getRedisClient();
      await redis.setex(`user_activity:${userId}`, 300, JSON.stringify(activity)); // 5 minutes TTL
      
      logger.debug(`Tracked activity for user ${userId}`, { activity: activityData.type });
    } catch (error) {
      logger.error('Error tracking user activity:', error);
    }
  }

  async processActivityQueue() {
    if (this.activityQueue.length === 0) {
      return;
    }

    const batchSize = 10;
    const batch = this.activityQueue.splice(0, batchSize);

    try {
      for (const activity of batch) {
        await this.processActivity(activity);
      }
    } catch (error) {
      logger.error('Error processing activity queue:', error);
    }
  }

  async processActivity(activity) {
    try {
      const { userId, type, data } = activity;

      switch (type) {
        case 'page_view':
          await this.handlePageView(userId, data);
          break;
        case 'transaction_start':
          await this.handleTransactionStart(userId, data);
          break;
        case 'transaction_complete':
          await this.handleTransactionComplete(userId, data);
          break;
        case 'financial_decision':
          await this.handleFinancialDecision(userId, data);
          break;
        case 'goal_update':
          await this.handleGoalUpdate(userId, data);
          break;
        case 'budget_check':
          await this.handleBudgetCheck(userId, data);
          break;
        default:
          logger.debug(`Unknown activity type: ${type}`);
      }
    } catch (error) {
      logger.error('Error processing activity:', error);
    }
  }

  async handlePageView(userId, data) {
    try {
      const { page, duration, referrer } = data;
      
      // Update user session
      const session = this.userSessions.get(userId) || {
        startTime: new Date(),
        pages: [],
        totalDuration: 0
      };
      
      session.pages.push({
        page,
        duration,
        timestamp: new Date(),
        referrer
      });
      
      session.totalDuration += duration || 0;
      this.userSessions.set(userId, session);
      
      // Check for intervention opportunities based on page
      await this.checkPageBasedInterventions(userId, page, data);
      
    } catch (error) {
      logger.error('Error handling page view:', error);
    }
  }

  async handleTransactionStart(userId, data) {
    try {
      const { amount, category, merchant } = data;
      
      // Store transaction context for potential intervention
      const redis = getRedisClient();
      await redis.setex(`transaction_context:${userId}`, 300, JSON.stringify({
        amount,
        category,
        merchant,
        startTime: new Date(),
        status: 'pending'
      }));
      
      // Check if this transaction needs immediate attention
      await this.checkTransactionRisk(userId, data);
      
    } catch (error) {
      logger.error('Error handling transaction start:', error);
    }
  }

  async handleTransactionComplete(userId, data) {
    try {
      const { amount, category, merchant, finalAmount } = data;
      
      // Clear transaction context
      const redis = getRedisClient();
      await redis.del(`transaction_context:${userId}`);
      
      // Analyze completed transaction
      const transactionData = {
        amount: finalAmount || amount,
        category,
        description: data.description || `${category} transaction`,
        merchant
      };
      
      // Trigger AI analysis
      const analysis = await AIService.analyzeFinancialDecision(transactionData, userId);
      
      if (analysis.shouldIntervene) {
        await this.triggerIntervention(userId, analysis.intervention);
      }
      
    } catch (error) {
      logger.error('Error handling transaction complete:', error);
    }
  }

  async handleFinancialDecision(userId, data) {
    try {
      const { decision, context, amount } = data;
      
      // Log the decision for analysis
      logger.financial(`User ${userId} made financial decision`, { decision, amount });
      
      // Check if decision needs intervention
      if (this.shouldInterveneOnDecision(decision, amount)) {
        const interventionData = {
          type: 'financial_decision',
          trigger: 'user_decision',
          context: {
            decision,
            amount,
            ...context
          }
        };
        
        await this.createIntervention(userId, interventionData);
      }
      
    } catch (error) {
      logger.error('Error handling financial decision:', error);
    }
  }

  async handleGoalUpdate(userId, data) {
    try {
      const { goalId, progress, action } = data;
      
      // Check goal progress and trigger interventions if needed
      if (progress < 0.5 && action === 'update') {
        await this.checkGoalInterventions(userId, data);
      }
      
    } catch (error) {
      logger.error('Error handling goal update:', error);
    }
  }

  async handleBudgetCheck(userId, data) {
    try {
      const { category, spent, budget, remaining } = data;
      
      // Check if budget is at risk
      const budgetUtilization = (spent / budget) * 100;
      
      if (budgetUtilization > 80) {
        await this.createBudgetWarning(userId, {
          category,
          spent,
          budget,
          utilization: budgetUtilization
        });
      }
      
    } catch (error) {
      logger.error('Error handling budget check:', error);
    }
  }

  async checkPageBasedInterventions(userId, page, data) {
    try {
      const interventionPages = {
        'investment': 'investment_advice',
        'shopping': 'spending_alert',
        'budget': 'budget_warning',
        'goals': 'goal_progress',
        'debt': 'debt_reduction'
      };
      
      const interventionType = interventionPages[page];
      if (interventionType) {
        await this.checkContextualIntervention(userId, interventionType, data);
      }
      
    } catch (error) {
      logger.error('Error checking page-based interventions:', error);
    }
  }

  async checkTransactionRisk(userId, data) {
    try {
      const { amount, category } = data;
      
      // Get user's spending patterns
      const recentTransactions = await FinancialTransaction.find({
        userId,
        category,
        date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
      });
      
      const totalSpent = recentTransactions.reduce((sum, t) => sum + t.amount, 0);
      const averageSpent = totalSpent / recentTransactions.length;
      
      // Check if this transaction is significantly higher than average
      if (amount > averageSpent * 2) {
        await this.createSpendingAlert(userId, {
          amount,
          category,
          average: averageSpent,
          ratio: amount / averageSpent
        });
      }
      
    } catch (error) {
      logger.error('Error checking transaction risk:', error);
    }
  }

  shouldInterveneOnDecision(decision, amount) {
    const highRiskDecisions = ['large_purchase', 'investment', 'loan'];
    const highAmountThreshold = 1000; // $1000
    
    return highRiskDecisions.includes(decision) || amount > highAmountThreshold;
  }

  async checkGoalInterventions(userId, data) {
    try {
      const { goalId, progress, targetAmount, targetDate } = data;
      
      const daysRemaining = Math.ceil((new Date(targetDate) - new Date()) / (1000 * 60 * 60 * 24));
      const progressRate = progress / (daysRemaining / 365); // Annualized progress rate
      
      if (progressRate < 0.8) {
        await this.createGoalIntervention(userId, {
          goalId,
          progress,
          targetAmount,
          targetDate,
          progressRate
        });
      }
      
    } catch (error) {
      logger.error('Error checking goal interventions:', error);
    }
  }

  async createBudgetWarning(userId, data) {
    try {
      const intervention = new AIIntervention({
        userId,
        type: 'budget_warning',
        trigger: 'threshold_exceeded',
        context: {
          category: data.category,
          spent: data.spent,
          budget: data.budget,
          utilization: data.utilization,
          timestamp: new Date()
        },
        analysis: {
          confidence: 0.9,
          riskLevel: 'medium',
          urgency: 'high',
          impact: 'moderate',
          reasoning: `Budget utilization for ${data.category} is at ${data.utilization.toFixed(1)}%`
        },
        recommendation: {
          title: 'Budget Warning',
          description: `You've used ${data.utilization.toFixed(1)}% of your ${data.category} budget. Consider reducing spending in this category.`,
          action: 'warn',
          suggestedActions: [
            {
              type: 'reduce_spending',
              description: 'Reduce spending in this category',
              impact: 'Stay within budget',
              effort: 'medium'
            }
          ]
        },
        delivery: {
          channel: 'in_app',
          priority: 7,
          timing: { sentAt: new Date() }
        }
      });
      
      await intervention.save();
      await this.triggerIntervention(userId, intervention);
      
    } catch (error) {
      logger.error('Error creating budget warning:', error);
    }
  }

  async createSpendingAlert(userId, data) {
    try {
      const intervention = new AIIntervention({
        userId,
        type: 'spending_alert',
        trigger: 'anomaly_detection',
        context: {
          amount: data.amount,
          category: data.category,
          average: data.average,
          ratio: data.ratio,
          timestamp: new Date()
        },
        analysis: {
          confidence: 0.85,
          riskLevel: 'medium',
          urgency: 'medium',
          impact: 'moderate',
          reasoning: `This ${data.category} transaction is ${data.ratio.toFixed(1)}x your average spending`
        },
        recommendation: {
          title: 'Unusual Spending Detected',
          description: `This ${data.category} transaction is significantly higher than your usual spending. Please review if this is necessary.`,
          action: 'suggest',
          suggestedActions: [
            {
              type: 'review_purchase',
              description: 'Review if this purchase is necessary',
              impact: 'Better spending decisions',
              effort: 'low'
            }
          ]
        },
        delivery: {
          channel: 'in_app',
          priority: 6,
          timing: { sentAt: new Date() }
        }
      });
      
      await intervention.save();
      await this.triggerIntervention(userId, intervention);
      
    } catch (error) {
      logger.error('Error creating spending alert:', error);
    }
  }

  async createGoalIntervention(userId, data) {
    try {
      const intervention = new AIIntervention({
        userId,
        type: 'goal_progress',
        trigger: 'goal_deadline',
        context: {
          goalId: data.goalId,
          progress: data.progress,
          targetAmount: data.targetAmount,
          targetDate: data.targetDate,
          progressRate: data.progressRate,
          timestamp: new Date()
        },
        analysis: {
          confidence: 0.8,
          riskLevel: 'low',
          urgency: 'medium',
          impact: 'moderate',
          reasoning: `Goal progress is behind schedule (${(data.progressRate * 100).toFixed(1)}% of expected rate)`
        },
        recommendation: {
          title: 'Goal Progress Update',
          description: 'Your goal progress is behind schedule. Consider increasing your savings rate to stay on track.',
          action: 'suggest',
          suggestedActions: [
            {
              type: 'increase_savings',
              description: 'Increase monthly savings contribution',
              impact: 'Stay on track with goal',
              effort: 'medium'
            }
          ]
        },
        delivery: {
          channel: 'in_app',
          priority: 5,
          timing: { sentAt: new Date() }
        }
      });
      
      await intervention.save();
      await this.triggerIntervention(userId, intervention);
      
    } catch (error) {
      logger.error('Error creating goal intervention:', error);
    }
  }

  async triggerIntervention(userId, intervention) {
    try {
      // Emit to connected socket
      const { io } = require('../index');
      io.to(`user_${userId}`).emit('ai_intervention', {
        id: intervention._id,
        type: intervention.type,
        title: intervention.recommendation.title,
        description: intervention.recommendation.description,
        urgency: intervention.analysis.urgency,
        actions: intervention.recommendation.suggestedActions
      });
      
      logger.intervention(`Triggered intervention for user ${userId}`, { interventionId: intervention._id });
      
    } catch (error) {
      logger.error('Error triggering intervention:', error);
    }
  }

  async startPeriodicTasks() {
    // Check for scheduled interventions every 5 minutes
    setInterval(async () => {
      await this.checkScheduledInterventions();
    }, 5 * 60 * 1000);
    
    // Clean up old sessions every hour
    setInterval(async () => {
      await this.cleanupOldSessions();
    }, 60 * 60 * 1000);
  }

  async checkScheduledInterventions() {
    try {
      // Check for users who haven't logged in recently
      const inactiveThreshold = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days
      
      const inactiveUsers = await User.find({
        lastLogin: { $lt: inactiveThreshold },
        isActive: true
      });
      
      for (const user of inactiveUsers) {
        await this.createEngagementIntervention(user._id);
      }
      
    } catch (error) {
      logger.error('Error checking scheduled interventions:', error);
    }
  }

  async createEngagementIntervention(userId) {
    try {
      const intervention = new AIIntervention({
        userId,
        type: 'engagement',
        trigger: 'scheduled',
        context: {
          lastLogin: new Date(),
          daysInactive: 7,
          timestamp: new Date()
        },
        analysis: {
          confidence: 0.7,
          riskLevel: 'low',
          urgency: 'low',
          impact: 'minimal',
          reasoning: 'User has been inactive for 7 days'
        },
        recommendation: {
          title: 'We Miss You!',
          description: 'It\'s been a while since you checked your financial health. Take a moment to review your progress.',
          action: 'inform',
          suggestedActions: [
            {
              type: 'check_progress',
              description: 'Review your financial progress',
              impact: 'Stay engaged with your finances',
              effort: 'low'
            }
          ]
        },
        delivery: {
          channel: 'email',
          priority: 3,
          timing: { sentAt: new Date() }
        }
      });
      
      await intervention.save();
      
    } catch (error) {
      logger.error('Error creating engagement intervention:', error);
    }
  }

  async cleanupOldSessions() {
    try {
      const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
      
      for (const [userId, session] of this.userSessions.entries()) {
        if (session.startTime < cutoffTime) {
          this.userSessions.delete(userId);
        }
      }
      
      // Clean up active users
      for (const [userId, userData] of this.activeUsers.entries()) {
        if (userData.lastActivity < cutoffTime) {
          this.activeUsers.delete(userId);
        }
      }
      
      logger.debug('Cleaned up old sessions and active users');
      
    } catch (error) {
      logger.error('Error cleaning up old sessions:', error);
    }
  }

  getActiveUsers() {
    return Array.from(this.activeUsers.keys());
  }

  getUserSession(userId) {
    return this.userSessions.get(userId);
  }

  isUserActive(userId) {
    return this.activeUsers.has(userId);
  }
}

module.exports = new RealTimeService(); 