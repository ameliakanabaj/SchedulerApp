import { DatePipe, NgClass, NgTemplateOutlet } from '@angular/common';
import { Component, EventEmitter, inject, input, Input, Output } from '@angular/core';
import { Availability as AvailabilityService, Modal, Toastr, User } from '@app/shared/services';
import { SetCustomHoursModal } from '../set-custom-hours-modal/set-custom-hours-modal';
import { Authentication } from '@app/core';
import { AvailabilityModel } from '@app/models';
import { AddNotesModal } from '../add-notes-modal/add-notes-modal';
import { ScheduleModel } from '@app/models/schedule.model';

export interface Shift {
    userId: number;
    userName: string;
    startDate: string;
    endDate: string;
}

const tempSchedule: ScheduleModel = {
    schedule_id: 1,
    organization_id: 4,
    date_from: "2025-12-04",
    date_to: "2025-12-25",
    generatedAt: 'poniedzialek',
    status: 'closed',
    deadline_generate_date: 'wtorek 21 grudnia',
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
    @Input() scheduleRange: ScheduleModel | null = null;
    @Input() schedules: ScheduleModel[] = [];
    @Input() availabilities: AvailabilityModel[] = [];

    @Output() updateAvailability = new EventEmitter();
    @Output() updateAdminSettings = new EventEmitter();

    customStart = '';
    customEnd = '';
    daysInMonth = this.generateDays(this.year, this.month);

    private availabilitiesToSend: AvailabilityModel[] = [];

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


    hasComments(day: Date): boolean {
        const iso = day.toISOString().split('T')[0];

        return this.availabilities.some(a =>
            a.start_time.startsWith(iso) && !!a.comments
        );
    }


    getAvailability(day: Date): AvailabilityModel | undefined {
        const iso = day.toISOString().split('T')[0];

        return this.availabilities.find(a => 
            a.start_time.startsWith(iso)
        );
    }

    setAvailability(day: Date, type: 'all-day' | 'custom' | 'cannot') {
        const iso = day.toISOString().split('T')[0];
        const existing = this.getAvailability(day);

        if (type === 'all-day') {
            const start = `${iso}T00:00:00`;
            const end   = `${iso}T23:59:59`;

            if (existing) {
                existing.start_time = start;
                existing.end_time = end;
            } else {
                this.availabilities.push({
                    start_time: start,
                    end_time: end,
                });
            }
        }

        if (type === 'cannot') {
            const start = `${iso}T00:00:00`;

            if (existing) {
                existing.start_time = start;
                existing.end_time = start;
            } else {
                this.availabilities.push({
                    start_time: start,
                    end_time: start,
                });
            }
        }
    }

    saveCustomHours(day: Date) {
        const iso = day.toISOString().split('T')[0];
        const start = `${iso}T${this.customStart}:00`;
        const end   = `${iso}T${this.customEnd}:00`;

        const existing = this.getAvailability(day);

        if (existing) {
            existing.start_time = start;
            existing.end_time = end;
        } else {
            this.availabilities.push({
                start_time: start,
                end_time: end,
            });
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

    openAddNoteModal(day: Date): void {
        const modalRef = this.modalService.openModal(AddNotesModal);

        modalRef.afterClosed$.subscribe((res: any) => {
            if (res) {
                this.addCommentToDay(day, res);
            }
        })
    }

    addCommentToDay(day: Date, comment: string): void {
        const iso = day.toISOString().split('T')[0];
        const existing = this.getAvailability(day);

        if (existing) {
            existing.comments = comment;
            return;
        }

        this.availabilities.push({
            start_time: `${iso}T00:00:00`,
            end_time: `${iso}T23:59:59`,
            comments: comment,
        });
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

    isInScheduleRange(day: Date): boolean {
        if (!this.scheduleRange) return false;

        const from = new Date(this.scheduleRange.date_from);
        const to = new Date(this.scheduleRange.date_to);

        const d = new Date(day);
        d.setHours(0,0,0,0);
        from.setHours(0,0,0,0);
        to.setHours(0,0,0,0);

        return d >= from && d <= to;
    }

    getDayType(day: Date): 'all-day' | 'custom' | 'cannot' | null {
        const av = this.getAvailability(day);
        if (!av) return null;

        const start = av.start_time.split('T')[1];
        const end = av.end_time.split('T')[1];

        if (start === "00:00:00" && end === "00:00:00") return 'cannot';
        if (start === "00:00:00" && end === "23:59:59") return 'all-day';
        return 'custom';
    }
}
