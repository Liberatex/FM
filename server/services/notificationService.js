const logger = require('../utils/logger');

class NotificationService {
  constructor() {
    this.notifications = new Map();
  }

  // Create a new notification
  async createNotification(userId, type, title, message, data = {}) {
    try {
      const notification = {
        id: this.generateId(),
        userId,
        type,
        title,
        message,
        data,
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Store notification (in production, this would be in a database)
      if (!this.notifications.has(userId)) {
        this.notifications.set(userId, []);
      }
      this.notifications.get(userId).push(notification);

      logger.info(`Notification created for user ${userId}: ${title}`);
      return notification;
    } catch (error) {
      logger.error('Error creating notification:', error);
      throw error;
    }
  }

  // Get notifications for a user
  async getNotifications(userId, limit = 50) {
    try {
      const userNotifications = this.notifications.get(userId) || [];
      return userNotifications
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, limit);
    } catch (error) {
      logger.error('Error getting notifications:', error);
      throw error;
    }
  }

  // Mark notification as read
  async markAsRead(userId, notificationId) {
    try {
      const userNotifications = this.notifications.get(userId) || [];
      const notification = userNotifications.find(n => n.id === notificationId);
      
      if (notification) {
        notification.isRead = true;
        notification.updatedAt = new Date();
        logger.info(`Notification ${notificationId} marked as read for user ${userId}`);
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Delete notification
  async deleteNotification(userId, notificationId) {
    try {
      const userNotifications = this.notifications.get(userId) || [];
      const index = userNotifications.findIndex(n => n.id === notificationId);
      
      if (index !== -1) {
        userNotifications.splice(index, 1);
        logger.info(`Notification ${notificationId} deleted for user ${userId}`);
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error('Error deleting notification:', error);
      throw error;
    }
  }

  // Send real-time notification
  async sendRealTimeNotification(io, userId, notification) {
    try {
      io.to(`user_${userId}`).emit('notification', notification);
      logger.info(`Real-time notification sent to user ${userId}`);
    } catch (error) {
      logger.error('Error sending real-time notification:', error);
      throw error;
    }
  }

  // Generate unique ID
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Start notification service
  start() {
    logger.info('Notification service started');
  }
}

module.exports = new NotificationService(); 