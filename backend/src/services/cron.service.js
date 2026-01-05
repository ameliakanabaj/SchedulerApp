const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();
const notificationService = require("./notifications.service");
const fs = require("fs");
const path = require("path");

const CHECK_INTERVAL = 60 * 1000; 
const REMINDERS_FILE = path.join(__dirname, "sent_reminders.json");

let sentReminders = new Map();

try {
    if (fs.existsSync(REMINDERS_FILE)) {
        const data = fs.readFileSync(REMINDERS_FILE, "utf8");
        sentReminders = new Map(Object.entries(JSON.parse(data)));
        console.log(`[CRON] Loaded sent reminders history: ${sentReminders.size} entries.`);
    }
} catch (err) {
    console.error("[CRON] Failed to load reminders history, starting fresh.", err);
}

function saveRemindersToDisk() {
    try {
        const obj = Object.fromEntries(sentReminders);
        fs.writeFileSync(REMINDERS_FILE, JSON.stringify(obj));
    } catch (err) {
        console.error("[CRON] Error saving reminders history:", err);
    }
}

function cleanupOldReminders() {
    const now = Date.now();
    const TWO_DAYS_MS = 48 * 60 * 60 * 1000;
    let deletedCount = 0;

    for (const [key, timestamp] of sentReminders.entries()) {
        if (now - timestamp > TWO_DAYS_MS) {
            sentReminders.delete(key);
            deletedCount++;
        }
    }

    if (deletedCount > 0) {
        console.log(`[CRON] Cleanup: Removed ${deletedCount} old reminder entries.`);
        saveRemindersToDisk();
    }
}

async function checkDeadlinesAndNotify() {
    console.log("[CRON] Checking deadlines...");
    
    cleanupOldReminders();
    
    try {
        const now = new Date();
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        const schedulesEndingSoon = await prisma.schedule.findMany({
            where: {
                deadline_generate_date: {
                    gte: now,
                    lte: tomorrow
                },
                status: { not: "GENERATED" }
            },
            include: { organization: true }
        });

        for (const schedule of schedulesEndingSoon) {
            const users = await prisma.user.findMany({
                where: { 
                    organization_id: schedule.organization_id,
                    role: "EMPLOYEE"
                },
                include: { availabilities: true }
            });

            for (const user of users) {
                const reminderKey = `${schedule.schedule_id}-${user.user_id}`;

                if (sentReminders.has(reminderKey)) {
                    continue; 
                }

                const hasAvailability = user.availabilities.some(a => {
                    const availStart = new Date(a.start_time);
                    return availStart >= schedule.date_from && availStart <= schedule.date_to;
                });

                if (!hasAvailability) {
                    console.log(`[CRON] Sending reminder to user ${user.user_id}`);
                    
                    const deadlineStr = new Date(schedule.deadline_generate_date).toLocaleDateString("en-GB");

                    await notificationService.sendNotification({
                        userId: user.user_id,
                        scheduleId: schedule.schedule_id,
                        type: "REMINDER_24H",
                        message: `Reminder: Less than 24h left to submit availability (deadline: ${deadlineStr}). Please submit now!`
                    }).catch(err => console.error("Cron notification error:", err));

                    sentReminders.set(reminderKey, Date.now());
                    saveRemindersToDisk();
                }
            }
        }

    } catch (error) {
        console.error("[CRON] Error checking deadlines:", error);
    }
}

function init() {
    checkDeadlinesAndNotify();
    setInterval(checkDeadlinesAndNotify, CHECK_INTERVAL);
}

module.exports = { init, checkDeadlinesAndNotify };
