import { DatePipe, NgClass, NgTemplateOutlet } from '@angular/common';
import { Component, inject, input, Input, OnInit } from '@angular/core';
import { Availability as AvailabilityService, Modal, Toastr } from '@app/shared/services';
import { SetCustomHoursModal } from '../set-custom-hours-modal/set-custom-hours-modal';
import { Authentication } from '@app/core';
import { AvailabilityModel, ShiftModel } from '@app/models';
import { AddNotesModal } from '../add-notes-modal/add-notes-modal';
import { ScheduleModel } from '@app/models/schedule.model';
import { Shift } from '@app/shared/services/shift/shift';
import { SetShiftHoursModal } from '@app/features/set-shift-hours-modal/set-shift-hours-modal';
import { Schedule } from '@app/shared/services/schedule/schedule';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-calendar',
  imports: [NgClass, NgTemplateOutlet, DatePipe],
  templateUrl: './calendar.html',
  styleUrl: './calendar.scss',
})
export class Calendar implements OnInit {
    xs = input(false);
    @Input() mode: 'availability' | 'admin' | 'view' = 'availability';
    @Input() month: number = new Date().getMonth();
    @Input() year: number = new Date().getFullYear();
    @Input() scheduleRange: ScheduleModel | null = null;
    @Input() availabilities: AvailabilityModel[] = [];

    daysInMonth = this.generateDays(this.year, this.month);

    // SHIFTS dane 

    shiftsFromDB: ShiftModel[] = [] // tylko do sprawdzenia czy trzeba robic api requesta z deletem (bo zmiany usuwaja sie instant)
    shifts: ShiftModel[] = [];
    shiftCopied?: ShiftModel;
    shiftClipboard?: ShiftModel;

    // AVAILABILITY dane
    activeMode: 'all-day' | 'custom' | 'cannot' = 'all-day';
    customStart = '';
    customEnd = '';


    scheduleId!: number;
    schedule?: ScheduleModel;
    isScheduleReadyToGenerate = false;

    readonly authService = inject(Authentication);

    private readonly modalService = inject(Modal);
    private readonly availabilityService = inject(AvailabilityService);
    private readonly toastrService = inject(Toastr);
    private readonly shiftService = inject(Shift);
    private readonly scheduleService = inject(Schedule);
    private readonly activatedRoute = inject(ActivatedRoute);

    /**
     * Wyciąga lokalną datę w formacie YYYY-MM-DD bez konwersji UTC
     */
    private getLocalDateString(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    /**
     * Konwertuje datę lokalną + godzinę na ISO string w UTC
     */
    private buildUtcISOString(day: Date, time: string): string {
        const [hours, minutes] = time.split(':').map(Number);

        const localDate = new Date(
            day.getFullYear(),
            day.getMonth(),
            day.getDate(),
            hours,
            minutes,
            0,
            0
        );

        console.log(localDate.toISOString);
        
        return localDate.toISOString(); // <-- UTC, .000Z
    }

    ngOnInit(): void {
        if (this.authService.hasRole('ORG_ADMIN')) {
            this.mode = 'admin';
        }

        if (this.mode === 'admin') {
            this.getShifts();
        } else if (this.mode === 'availability') {
            this.getUserAvailabilities();
        } else if (this.mode === 'view') {
            this.getSchedule();
        }

        this.activatedRoute.params.subscribe((param) => {
            this.scheduleId = param['id'];
        });
        
        this.scheduleService.canGenerate(this.scheduleId).subscribe((res) => {
            this.isScheduleReadyToGenerate = res.canGenerate;
        });

        const userId = this.authService.getUserId();

        this.availabilityService.getAvailabilityByUser(userId!).subscribe((res) => {
            this.availabilities = res;
        });
        
    }

    getSchedule(): void {
        this.scheduleService.getById(this.scheduleId).subscribe(sched => {
            this.schedule = sched;
        });
    }

    setMode(newMode: 'availability' | 'admin' | 'view'): void {
        this.mode = newMode;
        if (this.mode === 'admin') {
            this.getShifts();            
        }
    }

    getShifts(): void {
        this.shiftService.getAllShifts().subscribe({
            next: (shifts) => {
                this.shiftsFromDB = shifts;
                this.shifts = this.shiftsFromDB;
            },
            error: (err) => {
                this.toastrService.error(err.statusText, 'Could not load shifts');
            }
        });
    }

    removeShift(shift: ShiftModel): void {
        this.shifts = this.shifts.filter(s => s.shift_id !== shift.shift_id);


        if (this.shiftsFromDB.includes(shift)) {
            this.shiftService.deleteShift(shift.shift_id).subscribe();
        }
    }

    removeAllShifts(): void {
        this.shifts = [];
    }

    copyShift(shift: ShiftModel): void {
        this.shiftClipboard = { ...shift };
        this.toastrService.success(`Shift copied`);
    }

    pasteShift(day: Date): void {
        if (!this.shiftClipboard) {
            this.toastrService.error('No shift copied to clipboard');
            return;
        }

        const iso = day.toISOString().split('T')[0];
        const startTime = this.shiftClipboard.start_time.split('T')[1];
        const endTime = this.shiftClipboard.end_time.split('T')[1];

        this.shifts.push({
            organization_id: this.authService.getOrgId()!,
            start_time: `${iso}T${startTime}.000Z`,
            end_time: `${iso}T${endTime}.000Z`,
            required_people: this.shiftClipboard.required_people,
            place: this.shiftClipboard.place,
            assignments: []
        } as any);

        this.toastrService.success(`Shift pasted on ${day.getDate()}`);
    }

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

    hasComments(day: Date): boolean {
        const iso = this.getLocalDateString(day);

        return this.availabilities.some(a =>
            a.start_time.startsWith(iso) && !!a.comments
        );
    }

    getShiftsForDay(day: Date): ShiftModel[] {
        console.log(day.toDateString());
        console.log(day.toLocaleDateString());
        console.log(day.toLocaleTimeString());
        
        const iso = this.getLocalDateString(day);
        console.log(iso);
        console.log(this.shifts.filter(s => s.start_time.startsWith(iso)));
        
        // const iso = this.buildUtcISOString(day).split('T')[0];
        return this.shifts.filter(s => s.start_time.startsWith(iso));
    }

    getAvailability(day: Date): AvailabilityModel | undefined {
        // const iso = day.toISOString().split('T')[0];

        // return this.availabilities.find(a => 
        //     a.start_time.startsWith(iso)
        // );
        return this.availabilities.find(a => {
            const d = new Date(a.start_time);
            return (
                d.getFullYear() === day.getFullYear() &&
                d.getMonth() === day.getMonth() &&
                d.getDate() === day.getDate()
            );
        });
    }

    clearAvailability(): void {
        this.availabilities = [];
    }

    setAvailability(day: Date, type: 'all-day' | 'custom' | 'cannot') {
        const iso = this.getLocalDateString(day);
        const existing = this.getAvailability(day);

        if (type === 'all-day') {
            const start = `${iso}T00:00:00.000Z`;
            const end   = `${iso}T23:59:59.000Z`;

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
            const start = `${iso}T00:00:00.000Z`;

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
        // const iso = day.toISOString().split('T')[0];
        // const start = `${iso}T${this.customStart}:00.000Z`;
        // const end   = `${iso}T${this.customEnd}:00.000Z`;
        console.log('data custom hours:', day);
        
        const start = this.buildUtcISOString(day, this.customStart);
        const end   = this.buildUtcISOString(day, this.customEnd);


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

    openShiftModal(day: Date | Date[], shift: ShiftModel | null = null): void {
        console.log('otwarty dzien: ' + day);
        
        const modalRef = this.modalService.openModal(SetShiftHoursModal, {
            data: {
                day,
                shift
            }
        });

        modalRef.afterClosed$.subscribe((res: any) => {
            if (!res) return;

            if (Array.isArray(day)) {
                this.applyShiftToMultipleDays(day, res);
                return;
            }

            this.applyShiftToSingleDay(day, res, shift);
        });
    }

    applyShiftToScheduleRange(): void {
        if (!this.scheduleRange) return;

        const from = new Date(this.scheduleRange.date_from);
        const to = new Date(this.scheduleRange.date_to);

        const days: Date[] = [];

        const current = new Date(from);
        current.setHours(0, 0, 0, 0);
        to.setHours(0, 0, 0, 0);

        while (current <= to) {
            days.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }

        this.openShiftModal(days);
    }

    openCustomHoursModal(): void {
        this.activeMode = 'custom';
        const modalRef = this.modalService.openModal(SetCustomHoursModal);

        modalRef.afterClosed$.subscribe((res: any) => {
            if (res) {
                this.customStart = res.startTime;
                this.customEnd = res.endTime;
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
        const iso = this.getLocalDateString(day);
        const existing = this.getAvailability(day);

        if (existing) {
            existing.comments = comment;
            return;
        }

        this.availabilities.push({
            start_time: `${iso}T00:00:00Z`,
            end_time: `${iso}T23:59:59Z`,
            comments: comment,
        });
    }

    sendAvailability(): void {
        const userId = this.authService.getUserId();

        const payload = this.availabilities.map(s => ({
            ...s,
            user_id: userId,
        }));

        console.log(payload);
        
        
        if (userId) {
            this.availabilityService.bulkCreateAvailability(payload).subscribe({
                next: () => {
                    this.toastrService.success('Availability has been sent.');
                },
                error: (err) => {
                    this.toastrService.error(err.statusText, 'Something went wrong!');
                    console.log(err);
                    
                }
            });
        }
    }

    sendShifts(): void {
        console.log(this.shifts);
        
        this.shiftService.createBulk(this.shifts).subscribe({
            next: () => {
                this.toastrService.success('Shifts have been created.');
            },
            error: (err) => {
                if (err.error?.errors?.length) {
                    this.toastrService.error(err.error.errors.join(', '), 'Validation error');
                } else {
                    this.toastrService.error('Date is already in the past','Error');
                }
            }
        })
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

        console.log('DAY TYPE: ');
        console.log(day, start, end);
        

        if (start === "00:00:00.000Z" && end === "00:00:00.000Z") return 'cannot';
        if (start === "00:00:00.000Z" && end === "23:59:59.000Z") return 'all-day';
        return 'custom';
    }

    getDaySelectedHours(day: Date): string {
        const av = this.getAvailability(day);
        if (!av) return '';

        const start = new Date(av.start_time);
        const end = new Date(av.end_time);

        // const start = av.start_time.split('T')[1].substring(0,5);
        // const end = av.end_time.split('T')[1].substring(0,5);
        return `${start} - ${end}`;
    }
    
    private applyShiftToMultipleDays(days: Date[], data: any): void {
        for (const day of days) {
            const iso = day.toISOString().split('T')[0];

            this.shifts.push({
                organization_id: this.authService.getOrgId()!,
                start_time: `${iso}T${data.start}:00`,
                end_time: `${iso}T${data.end}:00`,
                required_people: data.required_people,
                place: data.place,
                assignments: []
            } as any);
        }
    }

    private applyShiftToSingleDay(day: Date, data: any, existingShift: ShiftModel | null): void {
        const iso = day.toISOString().split('T')[0];

        console.log('Po zamknieciu modala, przed build utc iso string:', data.start, data.end);

        const startTime = this.buildUtcISOString(day, data.start);
        const endTime = this.buildUtcISOString(day, data.end);
        
        console.log('Po przebudowie:', startTime, endTime);
        
        if (existingShift) {
            existingShift.start_time = `${iso}T${data.start}:00`;
            existingShift.end_time = `${iso}T${data.end}:00`;
            existingShift.required_people = data.required_people;
            existingShift.place = data.place;
        } else {
            this.shifts.push({
                organization_id: this.authService.getOrgId()!,
                start_time: startTime,
                end_time: endTime,
                required_people: data.required_people,
                place: data.place,
                assignments: []
            } as any);
        }
    }

    private getUserAvailabilities(): void {
        this.availabilityService.getAvailabilityByUser(this.authService.getUserId()!).subscribe({
            next: (availabilities) => {
                this.availabilities = availabilities;
            },
            error: (err) => {
                this.toastrService.error(err.statusText, 'Could not load availabilities');
            }
        });
    }
}
