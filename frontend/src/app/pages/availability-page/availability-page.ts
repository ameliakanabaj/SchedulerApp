import { DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Authentication } from '@app/core';
import { ScheduleModel } from '@app/models/schedule.model';
import { Calendar } from '@app/shared/components';
import { Schedule } from '@app/shared/services/schedule/schedule';

@Component({
  selector: 'app-availability-page',
  imports: [Calendar, RouterLink, DatePipe],
  templateUrl: './availability-page.html',
  styleUrl: './availability-page.scss',
})
export class AvailabilityPage implements OnInit {
    tempSchedules: ScheduleModel[] = [
        {
            id: 1,
            organization_id: 4,
            date_from: "2025-12-04",
            date_to: "2025-12-25",
            generatedAt: 'poniedzialek',
            status: 'closed',
            deadline_generate_date: 'wtorek 21 grudnia',
        }
    ]

    schedules: ScheduleModel[] = this.tempSchedules;
    orgId: number | null = -1;   
    
    private readonly scheduleService = inject(Schedule);
    private readonly authService = inject(Authentication);

    ngOnInit(): void {
        this.orgId = this.authService.getOrgId();

        if (this.orgId) {
            this.scheduleService.getAllByOrganization(this.orgId).subscribe((res) => {
                this.schedules = res;
            });
        }
    }
}
