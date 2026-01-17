import { DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from "@angular/router";
import { Modal } from '@app/shared/services';
import { PasswordReset } from '@app/features/password-reset/password-reset';
import { Authentication } from '@app/core';
import { Schedule } from '@app/shared/services/schedule/schedule';
import { ViewOnlyCalendar } from '@app/features/view-only-calendar/view-only-calendar';

@Component({
  selector: 'app-dashboard',
  imports: [ViewOnlyCalendar, DatePipe, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
    userHasOrganization = true;
    today = new Date();
    wasPasswordNotifDisplayed? = true;
    schedule?: number;

    mode: 'view' | 'availability' | 'admin'  = 'view';

    upcomingShifts: { date: Date, start: string, end: string}[] = [];

    notifications: { message: string, date: Date }[] = [];


    private readonly modalService = inject(Modal);
    private readonly authService = inject(Authentication);
    private readonly scheduleService = inject(Schedule);

    // ng on init z pobraniem schedules i wtedy upcoming shifts dodanie
    ngOnInit(): void {
        const val = localStorage.getItem('wasPasswordNotifDisplayed');
        this.wasPasswordNotifDisplayed = val === 'true';

        if (!this.wasPasswordNotifDisplayed) {
            this.openPasswordChangeModal();
        }

        if (!this.authService.getOrgId()) {
            this.userHasOrganization = false;
        }

        this.loadSchedule();
    }

    loadSchedule(): void {
        const orgId = this.authService.getOrgId();
        if (orgId) {
            this.scheduleService.getAllByOrganization(orgId).subscribe(schedules => {
                if (schedules.length > 0) {
                    const valid = schedules.find(s => s.status !== 'FAILED' && s.status !== 'PENDING');
                    this.schedule = valid?.schedule_id;
                    
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
