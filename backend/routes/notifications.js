const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount
} = require('../controllers/notificationController');

// Get user notifications
router.get('/', protect, getUserNotifications);

// Get unread count
router.get('/unread-count', protect, getUnreadCount);

// Mark notification as read
router.patch('/:notificationId/read', protect, markAsRead);

// Mark all notifications as read
router.patch('/mark-all-read', protect, markAllAsRead);

// Delete notification
router.delete('/:notificationId', protect, deleteNotification);

module.exports = router;
