import { Component, inject, OnInit } from '@angular/core';
import { DialogRef } from '@ngneat/dialog';
import { ModalHeader } from "@app/shared/components/modal-header/modal-header/modal-header";
import { FormsModule } from '@angular/forms';
import { Schedule } from '@app/shared/services/schedule/schedule';
import { Toastr } from '@app/shared/services';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-create-schedule',
  imports: [ModalHeader, FormsModule],
  templateUrl: './create-schedule.html',
  styleUrl: './create-schedule.scss',
})
export class CreateSchedule implements OnInit {
    private readonly modalRef = inject(DialogRef);
    private readonly scheduleService = inject(Schedule);
    private readonly toastrService = inject(Toastr);
    private readonly router = inject(Router);

    mode: 'create' | 'edit' = 'create';
    organizationId = this.modalRef.data.organizationId;
    scheduleId?: number = this.modalRef.data.scheduleId;

    dateFrom: string = '';
    dateTo: string = '';
    deadline: string = '';

    ngOnInit(): void {
        this.scheduleId = this.modalRef.data.scheduleId;
        this.organizationId = this.modalRef.data.organizationId;

        if (this.scheduleId) {
            this.mode = 'edit';
            this.loadSchedule();
        }
    }

    isDisabled(): boolean {
        return !this.dateFrom || !this.dateTo || !this.deadline || this.deadline > this.dateTo || this.dateFrom > this.dateTo;
    }

    private loadSchedule(): void {
        if (!this.scheduleId) return;
        
        this.scheduleService.getById(this.scheduleId).subscribe({
            next: (schedule) => {
                this.dateFrom = this.dateToInput(schedule.date_from);
                this.dateTo = this.dateToInput(schedule.date_to);
                this.deadline = this.dateToInput(schedule.deadline_generate_date);
            },
            error: () => {
                this.toastrService.error('Failed to load schedule');
                this.close(false);
            }
        });
    }

    createOrUpdateSchedule(): void {
        if (this.mode === 'create') {
            this.createSchedule();
        } else {
            this.updateSchedule();
        }
    }

    private createSchedule(): void {
        this.scheduleService.create({
            organization_id: this.organizationId,
            date_from: this.toISO(this.dateFrom),
            date_to: this.toISO(this.dateTo),
            deadline_generate_date: this.toISO(this.deadline),
        }).subscribe({
            next: (res) => {
                this.toastrService.success('Schedule created successfully');
                this.close(true);
                this.router.navigate(['/calendar', res.schedule_id]);
            },
            error: () => {
                this.toastrService.error('Failed to create schedule');
            }
        });
    }

    private updateSchedule(): void {
        if (!this.scheduleId) return;
        
        this.scheduleService.update(this.scheduleId, {
            date_from: this.toISO(this.dateFrom),
            date_to: this.toISO(this.dateTo),
            deadline_generate_date: this.toISO(this.deadline),
        }).subscribe({
            next: (res) => {
                this.toastrService.success('Schedule updated successfully');
                this.close(true);
                
            },
            error: () => {
                this.toastrService.error('Failed to update schedule');
            }
        });
    }

    close(save: boolean): void {
        this.modalRef.close(save);
    }

    private toISO(date: string): string {
        return date ? `${date}T00:00:00.000Z` : '';
    }

    private dateToInput(date: Date | string): string {
        if (!date) return '';
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
}
