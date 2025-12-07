async function generateSchedule(schedule_id) {
    const schedule = await prisma.schedule.findUnique({
        where: { schedule_id },
        include: {
            organization: true,
        },
    });

    const shifts = await prisma.shift.findMany({
        where: {
            organization_id: schedule.organization_id,
            start_time: { gte: schedule.date_from },
            end_time:   { lte: schedule.date_to }
        }
    });

    const users = await prisma.user.findMany({
        where: { organization_id: schedule.organization_id },
        include: { availabilities: true }
    });

    // 1. Build worker profiles
    const workerPool = users.map(u => ({
        user_id: u.user_id,
        assigned_hours: 0,
        availability: u.availabilities.map(a => ({
            start: new Date(a.start_time),
            end: new Date(a.end_time)
        }))
    }));

    const assignments = [];

    for (const shift of shifts) {
        const shiftStart = new Date(shift.start_time);
        const shiftEnd   = new Date(shift.end_time);
        const shiftHours = (shiftEnd - shiftStart) / 3600000;

        // 2. filter workers who are available
        const candidates = workerPool.filter(worker =>
            worker.availability.some(a =>
                a.start <= shiftStart && a.end >= shiftEnd
            )
        );

        if (candidates.length === 0) {
            console.warn("Brak dostępnych pracowników na shift:", shift.shift_id);
            continue;
        }

        // 3. sort by least total assigned hours (fairness)
        candidates.sort((a, b) => a.assigned_hours - b.assigned_hours);

        // 4. pick the best candidate
        const chosen = candidates[0];

        chosen.assigned_hours += shiftHours;

        assignments.push({
            shift_id: shift.shift_id,
            user_id: chosen.user_id,
            role_on_shift: null
        });
    }

    // 5. save assignments
    for (const a of assignments) {
        await prisma.assignment.create({
            data: {
                schedule_id,
                ...a
            }
        });
    }

    // 6. update schedule
    await prisma.schedule.update({
        where: { schedule_id },
        data: { status: "GENERATED" }
    });

    return assignments;
}
