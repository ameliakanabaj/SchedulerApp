import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ScheduleModel } from '@app/models/schedule.model';
import { Calendar } from '@app/shared/components';
import { Schedule } from '@app/shared/services/schedule/schedule';

const tempSchedule: ScheduleModel = {
    id: 1,
    organization_id: 4,
    date_from: "2025-12-04",
    date_to: "2025-12-25",
    generatedAt: 'poniedzialek',
    status: 'closed',
    deadline_generate_date: 'wtorek 21 grudnia',
}

@Component({
  selector: 'app-calendar-page',
  imports: [Calendar],
  templateUrl: './calendar-page.html',
  styleUrl: './calendar-page.scss',
})
export class CalendarPage {
    schedule: ScheduleModel | null = null;

    private readonly route = inject(ActivatedRoute);
    private readonly scheduleService = inject(Schedule);

    ngOnInit(): void {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        console.log(id);
        
        this.scheduleService.getById(id).subscribe(schedule => {
            this.schedule = schedule;
        });

        this.schedule = tempSchedule //temp
    }
}
