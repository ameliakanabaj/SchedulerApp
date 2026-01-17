import { Component, inject, Input, OnInit } from '@angular/core';
import { Schedule } from '@app/shared/services/schedule/schedule';
import {ShiftModel, AssignmentModel } from '@app/models';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { ScheduleModel } from '@app/models/schedule.model';
import { Shift } from '@app/shared/services/shift/shift';
import { Authentication } from '@app/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-view-only-calendar',
  imports: [DatePipe, NgFor, NgIf, FormsModule],
  templateUrl: './view-only-calendar.html',
  styleUrl: './view-only-calendar.scss',
})
export class ViewOnlyCalendar implements OnInit {
    @Input() scheduleId!: number;
    schedule?: ScheduleModel;
    shifts: ShiftModel[] = [];
    month: number = new Date().getMonth();
    year: number = new Date().getFullYear();
    daysInMonth: (Date|null)[] = [];
    schedules: ScheduleModel[] = [];
    selectedScheduleId!: number;
    weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    private readonly shiftsService = inject(Shift);
    private readonly authService = inject(Authentication);
    constructor(private scheduleService: Schedule) {}

    ngOnInit(): void {
        if (this.scheduleId) {
            this.scheduleService.getById(this.scheduleId).subscribe(sched => {
                this.schedule = sched;
                this.selectedScheduleId = sched.schedule_id;
                this.refreshCalendar();
            });

            this.shiftsService.getAllShifts().subscribe(shifts => {
                this.shifts = shifts;
                this.refreshCalendar();
            });
        }
        const organization_id = this.authService.getOrgId();
        this.scheduleService.getAllByOrganization(organization_id ?? 0).subscribe(schedules => {
            if (schedules.length > 0) {
                const valid = schedules.filter(s => s.status !== 'FAILED' && s.status !== 'PENDING');
                this.schedules = valid;
            }
        });
    }

    refreshCalendar(): void {
        this.daysInMonth = this.generateDays(this.year, this.month);
    }
    
    loadSchedule(scheduleId: number): void {
        this.scheduleService.getById(scheduleId).subscribe(sched => {
            this.schedule = sched;
            this.refreshCalendar();
        });
    }

    previousMonth(): void {
        if (this.month == 0) {
        this.year -= 1;
        this.month = 11;
        } else {
        this.month -= 1;
        }
        this.refreshCalendar();
    }

    nextMonth(): void {
        if (this.month == 11) {
        this.year += 1;
        this.month = 0;
        } else {
        this.month += 1;
        }
        this.refreshCalendar();
    }

    generateDays(year: number, month: number): (Date|null)[] {
        const days: (Date|null)[] = [];
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDayIndex = (firstDay.getDay() + 6) % 7;
        for (let i = 0; i < startDayIndex; i++) {
        days.push(null);
        }
        for (let d = 1; d <= lastDay.getDate(); d++) {
        days.push(new Date(year, month, d));
        }
        return days;
    }


    getShiftsForDay(day: Date): ShiftModel[] {
        if (!this.shifts || !day) return [];
        if (!this.isInScheduleRange(day)) return [];
        const iso = this.getLocalDateString(day);
        return this.shifts.filter(s => s.start_time.startsWith(iso));
    }

    isInScheduleRange(day: Date): boolean {
        if (!this.schedule) return true; // fallback: show all if no schedule loaded
        if (!this.schedule.date_from || !this.schedule.date_to) return true;
        const from = new Date(this.schedule.date_from);
        const to = new Date(this.schedule.date_to);
        const d = new Date(day);
        d.setHours(0,0,0,0);
        from.setHours(0,0,0,0);
        to.setHours(0,0,0,0);
        return d >= from && d <= to;
    }

    getLocalDateString(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    getAssignmentsForShift(shiftId: number): AssignmentModel[] {
        if (!this.schedule?.assignments) return [];
        console.log('ok');
        
        return this.schedule.assignments.filter(
            a => a.shift_id === shiftId
        );
    }
}
