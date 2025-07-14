const { Notification } = require('../models/Notification');
const { User } = require('../models/Users');

exports.getNotifications = async (req, res) => {
  try {
    // Get all notifications for the user
    const notifications = await Notification.find({ user_id: req.tokenData.id })
      .sort({ date_created: -1 }); // Sort by date, newest first

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
};

exports.updateNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_read } = req.body;

    // Find the notification and verify ownership
    const notification = await Notification.findOne({
      _id: id,
      user_id: req.tokenData.id
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Update the notification
    notification.is_read = is_read;
    await notification.save();

    res.json(notification);
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({ message: 'Error updating notification' });
  }
};

exports.createNotification = async (req, res) => {
  try {
    const { user_id, message, type, reference_id } = req.body;

    // Verify the user exists
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create the notification
    const notification = new Notification({
      user_id,
      message,
      type,
      reference_id
    });

    await notification.save();
    res.status(201).json(notification);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ message: 'Error creating notification' });
  }
}; 