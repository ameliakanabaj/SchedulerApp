import { DatePipe, NgClass, NgFor, NgTemplateOutlet } from '@angular/common';
import { Component, inject, input, Input, OnInit, ChangeDetectorRef, ChangeDetectionStrategy, SimpleChanges, OnChanges, signal } from '@angular/core';
import { Availability as AvailabilityService, Modal, Toastr } from '@app/shared/services';
import { SetCustomHoursModal } from '../set-custom-hours-modal/set-custom-hours-modal';
import { Authentication } from '@app/core';
import { AssignmentModel, AvailabilityModel, ShiftModel } from '@app/models';
import { AddNotesModal } from '../add-notes-modal/add-notes-modal';
import { ScheduleModel } from '@app/models/schedule.model';
import { Shift } from '@app/shared/services/shift/shift';
import { SetShiftHoursModal } from '@app/features/set-shift-hours-modal/set-shift-hours-modal';
import { Schedule } from '@app/shared/services/schedule/schedule';
import { ActivatedRoute } from '@angular/router';
import { ChangeAssignmentModal } from '../change-assignment-modal/change-assignment-modal';
import { Loading } from '../loading/loading';

@Component({
  selector: 'app-calendar',
  imports: [NgClass, NgTemplateOutlet, DatePipe, Loading],
  templateUrl: './calendar.html',
  styleUrl: './calendar.scss',
})
export class Calendar implements OnInit, OnChanges {
    xs = input(false);
    @Input() mode: 'availability' | 'admin' | 'view' = 'availability';
    @Input() month: number = new Date().getMonth();
    @Input() year: number = new Date().getFullYear();
    @Input() scheduleRange: ScheduleModel | null = null;
    @Input() availabilities: AvailabilityModel[] = [];

    isLoading = signal(true);

    isUserAdmin = false;

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

    // FULL SCHEDULE dane

    @Input() scheduleId!: number;
    schedule?: ScheduleModel;
    isScheduleReadyToGenerate = false;

    readonly authService = inject(Authentication);

    private readonly modalService = inject(Modal);
    private readonly availabilityService = inject(AvailabilityService);
    private readonly toastrService = inject(Toastr);
    private readonly shiftService = inject(Shift);
    private readonly scheduleService = inject(Schedule);
    private readonly activatedRoute = inject(ActivatedRoute);

    ngOnInit(): void {
        this.isUserAdmin = this.authService.hasRole('ORG_ADMIN');

        if (!this.scheduleId) {
            this.activatedRoute.params.subscribe((param) => {
                this.scheduleId = param['id'];
            });
        }

        this.setMode('admin');
        this.setMode('view');

        if (this.mode === 'admin') {
            this.getShifts();
        } else if (this.mode === 'availability') {
            this.getUserAvailabilities();
        } else if (this.mode === 'view') {
            this.getShifts();
            this.getSchedule();
        }

        if (this.scheduleId !== undefined && this.isUserAdmin) {
            this.scheduleService.canGenerate(this.scheduleId).subscribe((res) => {
                this.isScheduleReadyToGenerate = res.canGenerate;
            });
        }

        const userId = this.authService.getUserId();

        this.availabilityService.getAvailabilityByUser(userId!).subscribe((res) => {
            this.availabilities = res;
        });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['scheduleId'] && this.scheduleId) {
            this.onScheduleReady();
        }

        if (changes['mode'] && !changes['mode'].firstChange) {
            this.onModeChanged();
        }
    }

    generateSchedule(): void {
        this.isLoading.set(true);
        this.scheduleService.generateSchedule(this.scheduleId).subscribe({
            next: (generatedSchedule) => {
                this.isLoading.set(false);
                this.toastrService.success('Successfully generated new schedule.');
                
            },
            error: (err) => {
                this.toastrService.error('Error while generating schedule');
                this.isLoading.set(false);
            }
        })
    }

    getSchedule(): void {
        this.isLoading.set(true);
        this.scheduleService.getById(this.scheduleId).subscribe(sched => {
            this.isLoading.set(false);
            this.schedule = sched;
            if (this.schedule?.assignments) {
                this.schedule.assignments = [...this.schedule.assignments];
            }
            this.refreshCalendar();
        });
    }

    setMode(newMode: 'availability' | 'admin' | 'view'): void {
        this.mode = newMode;
        if (this.mode === 'admin') {
            this.getShifts();            
        } else if (this.mode === 'view') {
            this.getSchedule();
        }
    }

    getShifts(): void {
        this.isLoading.set(true);
        this.shiftService.getAllShifts().subscribe({
            next: (shifts) => {
                this.shiftsFromDB = shifts;
                if (this.shiftsFromDB.length > 0) {
                    this.shifts = [...this.shiftsFromDB];
                    localStorage.removeItem('calendar_shifts');
                } else {
                    const local = localStorage.getItem('calendar_shifts');
                    if (local) {
                        try {
                            this.shifts = JSON.parse(local);
                        } catch {
                            this.shifts = [];
                        }
                    } else {
                        this.shifts = [];
                    }
                }
                this.isLoading.set(false);
            },
            error: (err) => {
                this.toastrService.error(err.statusText, 'Could not load shifts');
                this.isLoading.set(false);
            }
        });
    }

    removeShift(shift: ShiftModel): void {
        this.shifts = this.shifts.filter(s => s.shift_id !== shift.shift_id);
        this.saveShiftsToLocalStorage();
        if (this.shiftsFromDB.includes(shift)) {
            this.shiftService.deleteShift(shift.shift_id).subscribe();
        }
    }

    removeAllShifts(): void {
        this.shifts = [];
        this.saveShiftsToLocalStorage();
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

        const iso = this.getLocalDateString(day);
        const startTime = this.shiftClipboard.start_time.split('T')[1];
        const endTime = this.shiftClipboard.end_time.split('T')[1];

        this.shifts.push({
            organization_id: this.authService.getOrgId()!,
            start_time: `${iso}T${startTime}`,
            end_time: `${iso}T${endTime}`,
            required_people: this.shiftClipboard.required_people,
            place: this.shiftClipboard.place,
            assignments: []
        } as any);
        this.saveShiftsToLocalStorage();
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
        this.isLoading.set(true);
        this.daysInMonth = this.generateDays(this.year, this.month);
        this.isLoading.set(false);
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
        if (!this.isInScheduleRange(day)) {
            return [];
        }
        const iso = this.getLocalDateString(day);
        return this.shifts.filter(s => s.start_time.startsWith(iso));
    }

    getAssignmentsByShiftForDay(day: Date): {
            shift: ShiftModel;
            assignments: AssignmentModel[];
        }[] {
        return this.getShiftsForDay(day).map(shift => ({
            shift,
            assignments: shift.assignments || []
        }));
    }

    getAssignmentsGroupedByShift(day: Date): {
        shift: ShiftModel;
        assignments: AssignmentModel[];
    }[] {

        return this.getShiftsForDay(day)
            .filter(s => s.assignments?.length)
            .map(shift => ({
                shift,
                assignments: shift.assignments!
            }));
    }

    hasAssignmentsForDay(day: Date): boolean {
        if (!this.schedule?.assignments) return false;

        const iso = this.getLocalDateString(day);

        return this.schedule.assignments.some(a =>
            a.shift.start_time.startsWith(iso)
        );
    }

    getAssignmentsForDay(day: Date): AssignmentModel[] {
        if (!this.schedule?.assignments?.length) return [];

        const iso = this.getLocalDateString(day);

        return this.schedule.assignments.filter(a =>
            a.shift.start_time.startsWith(iso)
        );
    }

    getAssignmentsForShift(shiftId: number): AssignmentModel[] {
        if (!this.schedule?.assignments) return [];

        return this.schedule.assignments.filter(
            a => a.shift_id === shiftId
        );
    }

    getAvailability(day: Date): AvailabilityModel | undefined {
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

    openChangeAssignmentModal(assignment: AssignmentModel): void {
        const modalRef = this.modalService.openModal(ChangeAssignmentModal, {
            data: {
                orgId: this.authService.getOrgId(),
                assignment
            }
        });
        modalRef.afterClosed$.subscribe((res: any) => {
            if (res) {
                this.getSchedule();
            }
        });
    }

    openShiftModal(day: Date | Date[], shift: ShiftModel | null = null): void {
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

        if (userId) {
            this.availabilityService.bulkCreateAvailability(payload).subscribe({
                next: () => {
                    this.toastrService.success('Availability has been sent.');
                },
                error: (err) => {
                    this.toastrService.error(err.statusText, 'Something went wrong!');
                }
            });
        }
    }

    sendShifts(): void {
        const shiftsNotFromDb = this.shifts.filter(s => !this.shiftsFromDB.includes(s));

        this.shiftService.createBulk(shiftsNotFromDb).subscribe({
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

        if (start === "00:00:00.000Z" && end === "00:00:00.000Z") return 'cannot';
        if (start === "00:00:00.000Z" && end === "23:59:59.000Z") return 'all-day';
        return 'custom';
    }

    getDaySelectedHours(day: Date): { start: string; end: string } | '' {
        const av = this.getAvailability(day);
        if (!av) return '';

        const start = new Date(av.start_time);
        const end = new Date(av.end_time);

        return { start: start, end: end } as any;
    }
    
    getDaySelectedHoursAsDate(day: any, type: 'start' | 'end'): Date | null {
      const hours = this.getDaySelectedHours(day);
      if (!hours || !hours[type]) return null;
      const [h, m] = hours[type].split(':');
      const date = new Date(day);
      date.setHours(+h, +m, 0, 0);
      return date;
    }

    private applyShiftToMultipleDays(days: Date[], data: any): void {
        for (const day of days) {
            const startTime = this.buildUtcISOString(day, data.start);
            const endTime = this.buildUtcISOString(day, data.end);

            this.shifts.push({
                organization_id: this.authService.getOrgId()!,
                start_time: startTime,
                end_time: endTime,
                required_people: data.required_people,
                place: data.place,
                assignments: []
            } as any);
        }
        this.saveShiftsToLocalStorage();
    }

    private applyShiftToSingleDay(day: Date, data: any, existingShift: ShiftModel | null): void {
        const startTime = this.buildUtcISOString(day, data.start);
        const endTime = this.buildUtcISOString(day, data.end);

        if (existingShift) {
            existingShift.start_time = startTime;
            existingShift.end_time = endTime;
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
        this.saveShiftsToLocalStorage();
    }
    private saveShiftsToLocalStorage(): void {
        if (this.shiftsFromDB.length === 0) {
            localStorage.setItem('calendar_shifts', JSON.stringify(this.shifts));
        }
    }

    private getUserAvailabilities(): void {
        this.isLoading.set(true);
        this.availabilityService.getAvailabilityByUser(this.authService.getUserId()!).subscribe({
            next: (availabilities) => {
                this.availabilities = availabilities;
                this.isLoading.set(false);
            },
            error: (err) => {
                this.toastrService.error(err.statusText, 'Could not load availabilities');
                this.isLoading.set(false);
            }
        });
    }

    private getLocalDateString(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

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

        return localDate.toISOString();
    }

    private onModeChanged(): void {
        if (!this.scheduleId) return;

        if (this.mode === 'view') {
            this.getShifts();
            this.getSchedule();
        }

        if (this.mode === 'admin') {
            this.getShifts();
        }
    }

    private onScheduleReady(): void {
        if (this.mode === 'view') {
            this.getShifts();
            this.getSchedule();
        }

        if (this.mode === 'admin') {
            this.getShifts();
        }

        if (this.mode === 'availability') {
            this.getUserAvailabilities();
        }

        this.scheduleService.canGenerate(this.scheduleId).subscribe(res => {
            this.isScheduleReadyToGenerate = res.canGenerate;
        });
    }
}
