const notificationService = require("../services/notifications.service");

async function getMyNotifications(req, res, next) {
  try {
    const userId = req.user.user_id; 

    const notifications = await notificationService.getUserNotifications(userId);

    res.json(notifications);
  } catch (err) {
    next(err);
  }
}

async function markAsRead(req, res, next) {
  try {
    const notificationId = req.params.id;
    const userId = req.user.user_id;
    
    await notificationService.markNotificationAsRead(notificationId, userId);

    res.json({ success: true, message: "Notification marked as read" });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getMyNotifications,
  markAsRead,
};
