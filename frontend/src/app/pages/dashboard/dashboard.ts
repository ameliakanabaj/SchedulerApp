import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from "@angular/router";
import { Modal, User } from '@app/shared/services';
import { PasswordReset } from '@app/features/password-reset/password-reset';
import { Authentication } from '@app/core';
import { Schedule } from '@app/shared/services/schedule/schedule';
import { ViewOnlyCalendar } from '@app/features/view-only-calendar/view-only-calendar';
import { UserModel } from '@app/models';
import { Loading } from '@app/shared/components/loading/loading';
import { Shift } from '@app/shared/services/shift/shift';

@Component({
  selector: 'app-dashboard',
  imports: [ViewOnlyCalendar, DatePipe, RouterLink, Loading],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
    userHasOrganization = true;
    today = new Date();
    schedule?: number;
    isLoading = signal(true);

    mode: 'view' | 'availability' | 'admin'  = 'view';

    upcomingShifts: { start: string, end: string}[] = [];

    notifications: { message: string, date: Date }[] = [];

    user: UserModel | null = null;

    private readonly modalService = inject(Modal);
    private readonly authService = inject(Authentication);
    private readonly scheduleService = inject(Schedule);
    private readonly shiftService = inject(Shift);
    private readonly userService = inject(User);

    // ng on init z pobraniem schedules i wtedy upcoming shifts dodanie
    ngOnInit(): void {
        const userId = this.authService.getUserId();

        this.userService.getById(Number(userId)).subscribe(user => {
            this.isLoading.set(false);
        });

        if (!this.authService.getOrgId()) {
            this.userHasOrganization = false;
        }

        if (this.user?.password_must_be_reset) {
            this.openPasswordChangeModal();
        }

        this.shiftService.getMyShifts().subscribe(shifts => {
            const upcoming = shifts.filter(s => new Date(s.start_time) >= this.today);
            this.upcomingShifts = upcoming.slice(0, 5).map(s => ({
                start: s.start_time,
                end: s.end_time
            }));
        });

        this.loadSchedule();
    }

    loadSchedule(): void {
        this.isLoading.set(true);
        const orgId = this.authService.getOrgId();
        if (orgId) {
            this.scheduleService.getAllByOrganization(orgId).subscribe(schedules => {
                if (schedules.length > 0) {
                    const valid = schedules.find(s => s.status !== 'FAILED' && s.status !== 'PENDING');
                    this.schedule = valid?.schedule_id;
                    this.isLoading.set(false);
                }
            });
        }
    }

    openPasswordChangeModal(): void {
        const modalRef = this.modalService.openModal(PasswordReset);

        modalRef.afterClosed$.subscribe((res: any) => {
            localStorage.setItem('wasPasswordNotifDisplayed', 'true');
        });
    }
}
