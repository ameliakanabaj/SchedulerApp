import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Authentication } from '@app/core';
import { CreateSchedule } from '@app/features/create-schedule/create-schedule';
import { ScheduleModel } from '@app/models/schedule.model';
import { Loading } from '@app/shared/components/loading/loading';
import { Modal, Toastr } from '@app/shared/services';
import { Schedule } from '@app/shared/services/schedule/schedule';

@Component({
  selector: 'app-availability-page',
  imports: [RouterLink, DatePipe, Loading],
  templateUrl: './availability-page.html',
  styleUrl: './availability-page.scss',
})
export class AvailabilityPage implements OnInit {
    userHasOrganization = true;
    isUserOrgAdmin = false;

    schedules: ScheduleModel[] = [];
    orgId: number | null = -1;   

    isLoading = signal(true);
    
    private readonly modalService = inject(Modal);
    private readonly scheduleService = inject(Schedule);
    private readonly toastrService = inject(Toastr);
    private readonly authService = inject(Authentication);

    ngOnInit(): void {
        this.isLoading.set(true);
        this.orgId = this.authService.getOrgId();

        if (this.orgId) {
            this.scheduleService.getAllByOrganization(this.orgId).subscribe((res) => {
                this.schedules = this.sortSchedulesByDateTo(res);
                this.isLoading.set(false);
            });
        } else {
            this.userHasOrganization = false;
        }

        if (this.authService.hasRole('ORG_ADMIN')) {
            this.isUserOrgAdmin = true;
        }
    }

    openNewScheduleModal(): void {
        const modalRef = this.modalService.openModal(CreateSchedule, {
            data: { organizationId: this.orgId }
        });

        modalRef.afterClosed$.subscribe((res: any) => {
            this.isLoading.set(true);
            if (res && this.orgId) {
                this.scheduleService.getAllByOrganization(this.orgId).subscribe((res) => {
                    this.schedules = this.sortSchedulesByDateTo(res);
                    this.isLoading.set(false);
                });
            }
        })
    }

    openEditScheduleModal(schedule: ScheduleModel): void {
        const modalRef = this.modalService.openModal(CreateSchedule, {
            data: { 
                organizationId: this.orgId,
                scheduleId: schedule.schedule_id
            }
        });

        modalRef.afterClosed$.subscribe((res: any) => {
            if (res && this.orgId) {
                this.scheduleService.getAllByOrganization(this.orgId).subscribe((res) => {
                    this.schedules = this.sortSchedulesByDateTo(res);
                });
            }
        })
    }

    deleteSchedule(scheduleId: number): void {
        this.isLoading.set(true);
        this.scheduleService.delete(scheduleId).subscribe(() => {
            if (this.orgId) {
                this.scheduleService.getAllByOrganization(this.orgId).subscribe({
                    next: (res) => {
                        this.schedules = this.sortSchedulesByDateTo(res);
                        this.isLoading.set(false);
                        this.toastrService.success('Schedule deleted successfully');
                    },
                    error: () => {
                        this.isLoading.set(false);
                        this.toastrService.error('Failed to delete schedule');
                    }
                });
            }
        });
    }
        

    private sortSchedulesByDateTo(schedules: ScheduleModel[]): ScheduleModel[] {
        return [...schedules].sort((a, b) => {
            const dateA = new Date(a.date_to).getTime();
            const dateB = new Date(b.date_to).getTime();
            return dateB - dateA;
        });
    }
}
