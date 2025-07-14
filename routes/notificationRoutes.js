const express = require("express");
const router = express.Router();
const { Notification, validNotification, validNotificationUpdate } = require("../models/Notification");
const { authToken } = require("../middlewares/authToken");
const {
  getNotifications,
  updateNotification,
  createNotification
} = require('../controllers/notificationsController');

// Get all notifications for the current user
router.get('/', authToken, getNotifications);

// Update a notification (mark as read)
router.put('/:id', authToken, updateNotification);

// Create a new notification
router.post('/', authToken, createNotification);

// Get a specific notification
router.get('/:id', authToken, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.json(notification);
  } catch (error) {
    console.error('Error fetching notification:', error);
    res.status(500).json({ message: 'Error fetching notification' });
  }
});

// Delete a notification
router.delete('/:id', authToken, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user_id: req.tokenData.id
    });
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Error deleting notification' });
  }
});

module.exports = router;
