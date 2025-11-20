import { DatePipe, NgClass, NgTemplateOutlet } from '@angular/common';
import { Component, EventEmitter, inject, input, Input, Output } from '@angular/core';
import { Availability as AvailabilityService, Modal, Toastr, User } from '@app/shared/services';
import { SetCustomHoursModal } from '../set-custom-hours-modal/set-custom-hours-modal';
import { Authentication } from '@app/core';
import { AvailabilityModel } from '@app/models';

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
    xs = input(false);

    @Input() mode = 'availability';
    @Input() month: number = new Date().getMonth();
    @Input() year: number = new Date().getFullYear();
    @Input() schedules: Schedule[] = [];
    @Input() availabilities: Availability[] = [];

    @Output() updateAvailability = new EventEmitter();
    @Output() updateAdminSettings = new EventEmitter();

    customStart = '';
    customEnd = '';
    daysInMonth = this.generateDays(this.year, this.month);
    private readonly modalService = inject(Modal);
    private readonly availabilityService = inject(AvailabilityService);
    private readonly authService = inject(Authentication);
    private readonly toastrService = inject(Toastr);

    generateDays(year: number, month: number): Date[] {
        const days: Date[] = [];

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const startDayIndex = (firstDay.getDay() + 6) % 7; 

        for (let i = 0; i < startDayIndex; i++) {
            days.push(null as any);
        }

        for (let d = 1; d <= lastDay.getDate(); d++) {
            days.push(new Date(year, month, d));
        }

        return days;
    }

    refreshCalendar(): void {
        this.daysInMonth = this.generateDays(this.year, this.month);
    }

    previousMonth(): void {
        if (this.month == 0) {
            this.year -= 1;
            this.month = 11;
            this.refreshCalendar();
            return
        }
        this.month -= 1;
        this.refreshCalendar();
    }

    nextMonth(): void {
        if (this.month == 11) {
            this.year += 1;
            this.month = 0;
            this.refreshCalendar();
            return;
        }
        this.month += 1;
        this.refreshCalendar();
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
        const userId = this.authService.getUserId();
        const filteredAvailabilites: AvailabilityModel[] = [];
        if (userId) {
            this.availabilityService.bulkCreateAvailability(userId, filteredAvailabilites).subscribe({
                next: (res) => {
                    this.toastrService.success('Availability has been sent.');
                },
                error: (err) => {
                    this.toastrService.error(err.statusText, 'Something went wrong!');
                }
            });
        }
    }
}
