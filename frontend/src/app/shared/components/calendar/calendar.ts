import { DatePipe, NgClass, NgTemplateOutlet } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { Modal } from '@app/shared/services';
import { SetCustomHoursModal } from '../set-custom-hours-modal/set-custom-hours-modal';

export interface Availability {
    date: string;
    type: 'all-day' | 'custom' | 'cannot';
    startDate?: string;
    endDate?: string;
}

export interface Schedule {
    date: string;
    open: boolean;
    requiredStaff?: number;
    shifts?: Shift[];
}

export interface Shift {
    userId: number;
    userName: string;
    startDate: string;
    endDate: string;
}

@Component({
  selector: 'app-calendar',
  imports: [NgClass, NgTemplateOutlet, DatePipe],
  templateUrl: './calendar.html',
  styleUrl: './calendar.scss',
})
export class Calendar {
    @Input() mode = 'availability';
    @Input() month: number = new Date().getMonth();
    @Input() year: number = new Date().getFullYear();
    @Input() schedules: Schedule[] = [];
    @Input() availabilities: Availability[] = [];

    @Output() updateAvailability = new EventEmitter();
    @Output() updateAdminSettings = new EventEmitter();

    customStart = '';
    customEnd = '';

    private modalService = inject(Modal);

    get daysInMonth(): Date[] {
        const days = [];
        const date = new Date(this.year, this.month, 1);
        while (date.getMonth() === this.month) {
            days.push(new Date(date));
            date.setDate(date.getDate() + 1);
        }
        return days;
    }

    previousMonth(): void {
        if (this.month == 0) {
            this.year -= 1;
            this.month = 11;
            return
        }
        this.month -= 1;
    }

    nextMonth(): void {
        if (this.month == 11) {
            this.year += 1;
            this.month = 0;
            return;
        }
        this.month += 1;
    }

    isDayClosed(date: Date): boolean {
        return false;
    }

    getSchedule(day: Date) {
        return this.schedules.find(s => s.date === day.toISOString().split('T')[0]);
    }

    getAvailability(day: Date) {
        return this.availabilities.find(a => a.date === day.toISOString().split('T')[0]);
    }

    setAvailability(day: Date, type: 'all-day' | 'custom' | 'cannot') {
        const date = day.toISOString().split('T')[0];
        const existing = this.getAvailability(day);

        if (existing) {
            existing.type = type;
        } else {
            this.availabilities.push({ date, type });
        }
    }

    saveCustomHours(day: Date) {
        const date = day.toISOString().split('T')[0];
        const start = new Date(`${date}T${this.customStart}`).toISOString();
        const end = new Date(`${date}T${this.customEnd}`).toISOString();

        const existing = this.getAvailability(day);
        if (existing) {
            existing.startDate = start;
            existing.endDate = end;
        } else {
            this.availabilities.push({ date, type: 'custom', startDate: start, endDate: end });
        }
    }

    openCustomHoursModal(day: Date, startTime: string, endTime: string): void {
        const modalRef = this.modalService.openModal(SetCustomHoursModal, { data: {
            minTime: startTime,
            maxTime: endTime,
        }});

        modalRef.afterClosed$.subscribe((res: any) => {
            if (res) {
                this.customStart = res.startTime;
                this.customEnd = res.endTime;

                this.saveCustomHours(day);
            }
        })
    }

    toggleOpen(day: Date) {
        const sched = this.getSchedule(day);
        if (sched) sched.open = !sched.open;
    }

    sendAvailability(): void {
        // this.availabilityService.sendAvailability(this.availabilities);
    }
}
