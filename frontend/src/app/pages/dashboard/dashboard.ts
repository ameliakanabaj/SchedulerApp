import { DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Calendar } from "@app/shared/components";
import { RouterLink } from "@angular/router";
import { Modal } from '@app/shared/services';
import { PasswordReset } from '@app/features/password-reset/password-reset';
import { Authentication } from '@app/core';

@Component({
  selector: 'app-dashboard',
  imports: [Calendar, DatePipe, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
    userHasOrganization = true;
    today = new Date();
    wasPasswordNotifDisplayed? = true;

    workdays = [];

    upcomingShifts = [
        { date: new Date(), start: '08:00', end: '16:00' },
        { date: new Date(Date.now() + 86400000), start: '12:00', end: '20:00' }
    ];

    notifications = [
        { message: 'Zmieniono Twoją zmianę na 23.11', date: new Date() },
        { message: 'Nowy komunikat od managera', date: new Date() }
    ]; // temp

    private readonly modalService = inject(Modal);
    private readonly authService = inject(Authentication);

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
    }

    openPasswordChangeModal(): void {
        const modalRef = this.modalService.openModal(PasswordReset);

        modalRef.afterClosed$.subscribe((res: any) => {
            localStorage.setItem('wasPasswordNotifDisplayed', 'true');
        });
    }
}
