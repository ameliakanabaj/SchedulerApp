const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();
const notificationService = require("./notifications.service");
const googleCalendarService = require("./googleCalendar.service");

async function generateSchedule(schedule_id) {

    try {
      const scheduleIdInt = parseInt(schedule_id, 10);
      const schedule = await prisma.schedule.findUnique({
        where: { schedule_id: scheduleIdInt },
        include: { organization: true },
      });
  
      if (!schedule) {
        throw new Error("Schedule not found");
      }

      const dateToEnd = new Date(schedule.date_to);
      dateToEnd.setHours(23, 59, 59, 999);
  
      const shifts = await prisma.shift.findMany({
        where: {
          organization_id: schedule.organization_id,
          start_time: { gte: schedule.date_from },
          end_time: { lt: dateToEnd },
        },
      });

      const users = await prisma.user.findMany({
        where: { organization_id: schedule.organization_id },
        include: { availabilities: true },
      });
  
      const workerPool = users.map((u) => ({
        user_id: u.user_id,
        assigned_hours: 0,
        availability: u.availabilities.map((a) => ({
          start: new Date(a.start_time),
          end: new Date(a.end_time),
        })),
      }));
  
      const assignments = [];
  
      for (const shift of shifts) {
        const shiftStart = new Date(shift.start_time);
        const shiftEnd = new Date(shift.end_time);
        const shiftHours = (shiftEnd - shiftStart) / 3600000;
  
        const requiredPeople = shift.required_people ?? 1; // jezeli jest przypisane required_people jako brak czyli null to algorytm zakłada, ze potrzebna jest jedna osoba
  
        let candidates = workerPool.filter((worker) =>
          worker.availability.some(
            (a) => a.start <= shiftStart && a.end >= shiftEnd // jezeli uzytkownik jest dostepny cały dzień to musi byc zaznaczone jako, ze jest dostępny od 00:00 do 23:59
          )
        );
  
        if (candidates.length < requiredPeople) {
            console.warn(
                `Shift ${shift.shift_id}: required ${requiredPeople}, available ${candidates.length}`
            );
            
            await prisma.schedule.update({
                where: { schedule_id: scheduleIdInt },
                data: { status: "FAILED" },
            });
  
            return [];
        }
  
        candidates.sort((a, b) => a.assigned_hours - b.assigned_hours);
  
        for (let i = 0; i < requiredPeople; i++) {
            const chosen = candidates[i];
    
            const worker = workerPool.find(
                (w) => w.user_id === chosen.user_id
            );
    
            worker.assigned_hours += shiftHours;

            assignments.push({
                shift_id: shift.shift_id,
                user_id: chosen.user_id,
                role_on_shift: null, 
            });
        }
      }
  
      for (const a of assignments) {
        const createdAssignment = await prisma.assignment.create({
          data: {
            schedule_id: scheduleIdInt,
            shift_id: a.shift_id,
            user_id: a.user_id,
            role_on_shift: a.role_on_shift,
          },
          include: {
            user: true,
            shift: true
          }
        });

        if (createdAssignment.user.google_refresh_token) {
          console.log(`[GOOGLE] User ${createdAssignment.user.email} has token. Sending...`);
            try {
                await googleCalendarService.createCalendarEvent(
                    createdAssignment.user,
                    createdAssignment.shift
                );
                console.log(`[GOOGLE] Successfully sent to calendar!`);
            } catch (err) {
                console.error(`[GOOGLE] Error for user ${createdAssignment.user_id}:`, err.message);
            }
        } else {
            console.log(`[GOOGLE] User ${createdAssignment.user.email} has NO google_refresh_token.`);
        }
      }
  
      await prisma.schedule.update({
        where: { schedule_id: scheduleIdInt },
        data: { 
          status: "GENERATED",
          generated_at: new Date(),
        },
      });

      const admins = await prisma.user.findMany({
          where: { 
            organization_id: schedule.organization_id,
            role: "ORG_ADMIN" 
          }
      });

      for (const admin of admins) {
          notificationService.sendNotification({
            userId: admin.user_id,
            scheduleId: schedule_id,
            type: "SCHEDULE_GENERATED",
            message: `Schedule #${schedule_id} has been successfully generated.`
          }).catch(err => console.error("Notification error:", err));
      }

      console.log(assignments);
      return assignments;

    } catch (error) {
      console.error("Schedule generation failed:", error);
  
      await prisma.schedule.update({
        where: { schedule_id: scheduleIdInt },
        data: { 
          status: "FAILED",
          generated_at: new Date(), 
        },
      });
  
      throw error;
    }
}

module.exports = {
  generateSchedule,
};
