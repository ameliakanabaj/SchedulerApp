import { DatePipe, NgClass } from '@angular/common';
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
import { NotificationModel } from '@app/models/notification.model';
import { Notification } from '@app/shared/services/notification/notification';
import { trigger, transition, style, animate } from '@angular/animations';
import { GoogleAuth } from '@app/shared/services/google-auth/google-auth';
import { ConfirmModal } from '@app/shared/components/confirm-modal/confirm-modal';

@Component({
  selector: 'app-dashboard',
  imports: [ViewOnlyCalendar, DatePipe, RouterLink, Loading, NgClass],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'translateX(20px)' }))
      ])
    ])
  ]
})
export class Dashboard implements OnInit {
    userHasOrganization = true;
    today = new Date();
    schedule?: number;
    isLoading = signal(true);

    mode: 'view' | 'availability' | 'admin'  = 'view';

    upcomingShifts: { start: string, end: string}[] = [];

    notifications: NotificationModel[] = [];
    
    get unreadNotifications(): NotificationModel[] {
        return this.notifications.filter(n => !n.is_read);
    }

    user: UserModel | null = null;

    private readonly modalService = inject(Modal);
    private readonly authService = inject(Authentication);
    private readonly scheduleService = inject(Schedule);
    private readonly shiftService = inject(Shift);
    private readonly userService = inject(User);
    private readonly notificationService = inject(Notification);

    // ng on init z pobraniem schedules i wtedy upcoming shifts dodanie
    ngOnInit(): void {
        const userId = this.authService.getUserId();

        this.userService.getById(Number(userId)).subscribe(user => {
            this.user = user;
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
        this.getMyNotifications();
    }

    getMyNotifications(): void {
        this.notificationService.getMyNotifications().subscribe(notifications => {
            this.notifications = notifications;
            console.log(notifications);
            
        });
    }

    markAsRead(notificationId: number): void {
        this.notificationService.markAsRead(notificationId).subscribe(() => {
            const notif = this.notifications.find(n => n.notification_id === notificationId);
            if (notif) {
                notif.is_read = true;
            }
        });
    }

    getNotificationIcon(type: string): string {
        const iconMap: { [key: string]: string } = {
            'SCHEDULE_GENERATED': 'fa-calendar-check',
            'AVAILABILITY_OPEN': 'fa-calendar-days',
            'MISSING_AVAILABILITY': 'fa-triangle-exclamation',
            'REMINDER_24H': 'fa-clock',
            'SCHEDULE_DELETED': 'fa-calendar-xmark',
            'SCHEDULE_ERROR': 'fa-circle-exclamation',
        };
        return `fa-solid ${iconMap[type] || 'fa-bell'}`;
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

    private readonly googleAuthService = inject(GoogleAuth);

    connectGoogle(): void {
        this.googleAuthService.getConnectUrl().subscribe({
        next: (res) => {
            if (res.url) {
            window.location.href = res.url;
            }
        },
        error: (err) => console.error('Failed to get Google URL', err)
        });
    }

    disconnectGoogle(): void {
        const modalRef = this.modalService.openModal(ConfirmModal, {
            data: {
                title: 'Disconnect Google Calendar',
                message: 'Your shifts will no longer be automatically synced to your Google Calendar. Are you sure?'
            }
        });

        modalRef.afterClosed$.subscribe((confirmed: boolean) => {
            if (confirmed) {
                this.googleAuthService.disconnect().subscribe({
                    next: () => {
                        if (this.user) {
                            this.user.is_google_connected = false;
                        }
                    },
                    error: (err) => console.error('Failed to disconnect', err)
                });
            }
        });
    }
}
