const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();
const emailService = require("./email.service");

async function sendNotification({ userId, scheduleId = null, type, message }) {
  try {
    const user = await prisma.user.findUnique({
      where: { user_id: Number(userId) },
    });

    if (!user || !user.email) {
      console.error(`User or email not found for ID: ${userId}`);
      return;
    }

    const subject = mapTypeToSubject(type);
    
    const emailSent = await emailService.sendEmail(user.email, subject, message);

    const status = emailSent ? "SENT" : "FAILED";

    const notification = await prisma.notification.create({
      data: {
        user_id: Number(userId),
        schedule_id: scheduleId ? Number(scheduleId) : null,
        type: type,
        status: status,
        message: message,
        sent_at: emailSent ? new Date() : null,
      },
    });

    return notification;

  } catch (error) {
    console.error("Error sending notification:", error);
    throw error;
  }
}

function mapTypeToSubject(type) {
  switch (type) {
    case "SCHEDULE_GENERATED":
      return "New schedule generated";
    case "AVAILABILITY_OPEN":
      return "Availability window is now open";
    case "MISSING_AVAILABILITY":
      return "Urgent: Missing availability";
    case "REMINDER_24H":
      return "Reminder: 24h left to submit availability";
    default:
      return "Notification from Scheduler System";
  }
}

async function getUserNotifications(userId) {
  try {
    const notifications = await prisma.notification.findMany({
      where: { 
        user_id: Number(userId) 
      },
      orderBy: { 
        sent_at: 'desc'
      },
      take: 20
    });

    return notifications;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
}

async function markNotificationAsRead(notificationId, userId) {
  try {
    const notification = await prisma.notification.findFirst({
        where: {
            notification_id: Number(notificationId),
            user_id: Number(userId)
        }
    });

    if (!notification) {
        throw new Error("Notification not found or access denied");
    }

    const updated = await prisma.notification.update({
      where: { notification_id: Number(notificationId) },
      data: { is_read: true },
    });

    return updated;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
}

module.exports = {
  sendNotification,
  getUserNotifications,
  markNotificationAsRead,
};
