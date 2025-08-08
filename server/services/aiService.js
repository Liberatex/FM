const OpenAI = require('openai');
const natural = require('natural');
const logger = require('../utils/logger');
const User = require('../models/User');
const FinancialTransaction = require('../models/FinancialTransaction');
const AIIntervention = require('../models/AIIntervention');
const { getRedisClient } = require('../config/redis');

class AIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    this.tokenizer = new natural.WordTokenizer();
    this.confidenceThreshold = parseFloat(process.env.AI_CONFIDENCE_THRESHOLD) || 0.8;
    this.interventionCooldown = parseInt(process.env.AI_INTERVENTION_COOLDOWN) || 300000; // 5 minutes
    
    // Cache for user financial profiles
    this.userProfileCache = new Map();
    this.lastInterventionCache = new Map();
  }

  async initialize() {
    try {
      logger.ai('Initializing AI Service...');
      
      // Test OpenAI connection
      const testResponse = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 10
      });
      
      logger.ai('OpenAI connection successful');
      
      // Initialize caches
      await this.initializeCaches();
      
      logger.ai('AI Service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize AI Service:', error);
      throw error;
    }
  }

  async initializeCaches() {
    try {
      const redis = getRedisClient();
      
      // Clear old caches
      await redis.del('ai_user_profiles');
      await redis.del('ai_intervention_cooldowns');
      
      logger.ai('AI caches initialized');
    } catch (error) {
      logger.error('Failed to initialize AI caches:', error);
    }
  }

  async analyzeFinancialDecision(transactionData, userId) {
    try {
      logger.ai(`Analyzing financial decision for user ${userId}`, { transactionData });
      
      // Check intervention cooldown
      if (await this.isInCooldown(userId, transactionData.category)) {
        logger.ai(`Intervention in cooldown for user ${userId}`);
        return { shouldIntervene: false };
      }
      
      // Get user profile
      const userProfile = await this.getUserFinancialProfile(userId);
      if (!userProfile) {
        logger.error(`User profile not found for ${userId}`);
        return { shouldIntervene: false };
      }
      
      // Analyze transaction
      const analysis = await this.performTransactionAnalysis(transactionData, userProfile);
      
      // Determine if intervention is needed
      const shouldIntervene = this.shouldIntervene(analysis, userProfile);
      
      if (shouldIntervene) {
        // Create intervention
        const intervention = await this.createIntervention(analysis, userId, transactionData);
        
        // Set cooldown
        await this.setCooldown(userId, transactionData.category);
        
        logger.intervention(`Created intervention for user ${userId}`, { interventionId: intervention._id });
        
        return {
          shouldIntervene: true,
          intervention: intervention
        };
      }
      
      return { shouldIntervene: false };
    } catch (error) {
      logger.error('Error analyzing financial decision:', error);
      return { shouldIntervene: false, error: error.message };
    }
  }

  async performTransactionAnalysis(transactionData, userProfile) {
    try {
      const prompt = this.buildAnalysisPrompt(transactionData, userProfile);
      
      const response = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are an expert financial advisor AI. Analyze the transaction and provide insights with confidence scores. Be concise but thorough.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 2000,
        temperature: 0.3
      });
      
      const analysis = JSON.parse(response.choices[0].message.content);
      
      // Validate analysis
      if (!this.validateAnalysis(analysis)) {
        throw new Error('Invalid analysis response from AI');
      }
      
      return analysis;
    } catch (error) {
      logger.error('Error performing transaction analysis:', error);
      throw error;
    }
  }

  buildAnalysisPrompt(transactionData, userProfile) {
    const { amount, category, description, merchant } = transactionData;
    const { financialProfile, aiPreferences } = userProfile;
    
    return `
Analyze this financial transaction and provide insights:

Transaction Details:
- Amount: $${amount}
- Category: ${category}
- Description: ${description}
- Merchant: ${merchant}

User Financial Profile:
- Monthly Income: $${financialProfile.income.monthly}
- Monthly Expenses: $${financialProfile.expenses.monthly}
- Current Savings: $${financialProfile.savings.current}
- Total Debt: $${financialProfile.debt.total}
- Risk Tolerance: ${financialProfile.riskTolerance}
- Financial Health Score: ${userProfile.financialHealthScore}

AI Preferences:
- Intervention Level: ${aiPreferences.interventionLevel}
- Notification Frequency: ${aiPreferences.notificationFrequency}

Provide analysis in JSON format:
{
  "confidence": 0.85,
  "riskLevel": "medium",
  "urgency": "medium",
  "impact": "moderate",
  "reasoning": "Brief explanation of the analysis",
  "factors": [
    {
      "name": "factor_name",
      "weight": 0.3,
      "description": "factor description"
    }
  ],
  "recommendation": {
    "title": "Recommendation title",
    "description": "Detailed recommendation",
    "action": "suggest",
    "suggestedActions": [
      {
        "type": "action_type",
        "description": "action description",
        "impact": "impact description",
        "effort": "effort level"
      }
    ],
    "expectedOutcome": {
      "shortTerm": "short term outcome",
      "longTerm": "long term outcome",
      "probability": 0.8
    }
  },
  "shouldIntervene": true
}
    `;
  }

  validateAnalysis(analysis) {
    const requiredFields = ['confidence', 'riskLevel', 'urgency', 'impact', 'reasoning', 'recommendation'];
    return requiredFields.every(field => analysis.hasOwnProperty(field));
  }

  shouldIntervene(analysis, userProfile) {
    // Check confidence threshold
    if (analysis.confidence < this.confidenceThreshold) {
      return false;
    }
    
    // Check user preferences
    const { interventionLevel } = userProfile.aiPreferences;
    
    switch (interventionLevel) {
      case 'minimal':
        return analysis.urgency === 'immediate' && analysis.impact === 'major';
      case 'moderate':
        return analysis.urgency === 'high' || analysis.impact === 'significant';
      case 'aggressive':
        return analysis.urgency !== 'low' || analysis.impact !== 'minimal';
      default:
        return analysis.urgency === 'high' || analysis.impact === 'significant';
    }
  }

  async createIntervention(analysis, userId, transactionData) {
    try {
      const intervention = new AIIntervention({
        userId,
        type: this.determineInterventionType(analysis, transactionData),
        trigger: 'transaction',
        context: {
          amount: transactionData.amount,
          category: transactionData.category,
          merchant: transactionData.merchant,
          timestamp: new Date()
        },
        analysis: {
          confidence: analysis.confidence,
          riskLevel: analysis.riskLevel,
          urgency: analysis.urgency,
          impact: analysis.impact,
          reasoning: analysis.reasoning,
          factors: analysis.factors || []
        },
        recommendation: analysis.recommendation,
        delivery: {
          channel: 'in_app',
          priority: this.calculatePriority(analysis),
          timing: {
            sentAt: new Date()
          }
        },
        metadata: {
          modelVersion: process.env.OPENAI_MODEL || 'gpt-4',
          algorithm: 'openai-gpt4',
          executionTime: Date.now()
        }
      });
      
      await intervention.save();
      
      // Update user analytics
      await User.findByIdAndUpdate(userId, {
        $inc: { 'analytics.totalInterventions': 1 },
        $set: { 'analytics.lastIntervention': new Date() }
      });
      
      return intervention;
    } catch (error) {
      logger.error('Error creating intervention:', error);
      throw error;
    }
  }

  determineInterventionType(analysis, transactionData) {
    const { category, amount } = transactionData;
    const { riskLevel, impact } = analysis;
    
    // High-risk spending
    if (riskLevel === 'high' && category === 'shopping') {
      return 'spending_alert';
    }
    
    // Budget concerns
    if (impact === 'significant' && ['housing', 'transportation', 'food'].includes(category)) {
      return 'budget_warning';
    }
    
    // Investment opportunities
    if (category === 'investment' && analysis.confidence > 0.9) {
      return 'investment_advice';
    }
    
    // Debt reduction
    if (category === 'debt_payment') {
      return 'debt_reduction';
    }
    
    // Default to spending alert
    return 'spending_alert';
  }

  calculatePriority(analysis) {
    const { urgency, impact, confidence } = analysis;
    
    let priority = 5; // Default priority
    
    // Adjust based on urgency
    switch (urgency) {
      case 'immediate': priority += 3; break;
      case 'high': priority += 2; break;
      case 'medium': priority += 1; break;
    }
    
    // Adjust based on impact
    switch (impact) {
      case 'major': priority += 2; break;
      case 'significant': priority += 1; break;
    }
    
    // Adjust based on confidence
    if (confidence > 0.9) priority += 1;
    
    return Math.min(priority, 10);
  }

  async getUserFinancialProfile(userId) {
    try {
      // Check cache first
      const redis = getRedisClient();
      const cached = await redis.get(`ai_user_profile:${userId}`);
      
      if (cached) {
        return JSON.parse(cached);
      }
      
      // Get from database
      const user = await User.findById(userId).select('financialProfile aiPreferences financialHealthScore');
      
      if (!user) {
        return null;
      }
      
      const profile = {
        financialProfile: user.financialProfile,
        aiPreferences: user.aiPreferences,
        financialHealthScore: user.financialHealthScore
      };
      
      // Cache for 5 minutes
      await redis.setex(`ai_user_profile:${userId}`, 300, JSON.stringify(profile));
      
      return profile;
    } catch (error) {
      logger.error('Error getting user financial profile:', error);
      return null;
    }
  }

  async isInCooldown(userId, category) {
    try {
      const redis = getRedisClient();
      const cooldownKey = `ai_cooldown:${userId}:${category}`;
      const cooldown = await redis.get(cooldownKey);
      
      return cooldown !== null;
    } catch (error) {
      logger.error('Error checking cooldown:', error);
      return false;
    }
  }

  async setCooldown(userId, category) {
    try {
      const redis = getRedisClient();
      const cooldownKey = `ai_cooldown:${userId}:${category}`;
      
      await redis.setex(cooldownKey, Math.floor(this.interventionCooldown / 1000), '1');
    } catch (error) {
      logger.error('Error setting cooldown:', error);
    }
  }

  async getPersonalizedRecommendations(userId) {
    try {
      const userProfile = await this.getUserFinancialProfile(userId);
      if (!userProfile) {
        return [];
      }
      
      const prompt = this.buildRecommendationsPrompt(userProfile);
      
      const response = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a personalized financial advisor. Provide actionable recommendations based on the user profile.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1500,
        temperature: 0.4
      });
      
      const recommendations = JSON.parse(response.choices[0].message.content);
      return recommendations.recommendations || [];
    } catch (error) {
      logger.error('Error getting personalized recommendations:', error);
      return [];
    }
  }

  buildRecommendationsPrompt(userProfile) {
    const { financialProfile, financialHealthScore } = userProfile;
    
    return `
Based on this user's financial profile, provide 3-5 personalized recommendations:

Financial Profile:
- Monthly Income: $${financialProfile.income.monthly}
- Monthly Expenses: $${financialProfile.expenses.monthly}
- Current Savings: $${financialProfile.savings.current}
- Total Debt: $${financialProfile.debt.total}
- Risk Tolerance: ${financialProfile.riskTolerance}
- Financial Health Score: ${financialHealthScore}

Provide recommendations in JSON format:
{
  "recommendations": [
    {
      "title": "Recommendation title",
      "description": "Detailed description",
      "category": "savings|debt|investment|budget",
      "priority": "high|medium|low",
      "expectedImpact": "impact description",
      "actionSteps": ["step1", "step2", "step3"]
    }
  ]
}
    `;
  }

  async updateInterventionFeedback(interventionId, feedback) {
    try {
      const intervention = await AIIntervention.findById(interventionId);
      if (!intervention) {
        throw new Error('Intervention not found');
      }
      
      intervention.userResponse.feedback = {
        rating: feedback.rating,
        helpful: feedback.helpful,
        comments: feedback.comments,
        timestamp: new Date()
      };
      
      intervention.userResponse.status = 'acknowledged';
      
      // Calculate learning metrics
      intervention.learning.userSatisfaction = feedback.rating;
      intervention.learning.effectiveness = feedback.helpful ? 0.8 : 0.2;
      
      await intervention.save();
      
      logger.ai(`Updated intervention feedback for ${interventionId}`, { feedback });
      
      return intervention;
    } catch (error) {
      logger.error('Error updating intervention feedback:', error);
      throw error;
    }
  }
}

module.exports = new AIService(); 