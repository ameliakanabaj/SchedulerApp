import { Component, inject, OnInit } from '@angular/core';
import { DialogRef } from '@ngneat/dialog';
import { FormsModule } from '@angular/forms';
import { ModalHeader } from "@app/shared/components/modal-header/modal-header/modal-header";
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-set-shift-hours-modal',
  imports: [FormsModule, ModalHeader, DatePipe],
  templateUrl: './set-shift-hours-modal.html',
  styleUrl: './set-shift-hours-modal.scss',
})
export class SetShiftHoursModal implements OnInit {
    day: Date | Date[] = new Date();
    startTime = '';
    endTime = '';
    required_people = 1;
    place = '';

    private readonly modalRef = inject(DialogRef);

    ngOnInit(): void {
        const data = this.modalRef.data ?? {};
        if (data.day) this.day = data.day;
        if (data.shift) {
            const s: any = data.shift;
            // shift model may store full ISO timestamps — extract times for inputs
            if (s.start_time) this.startTime = s.start_time.split('T')[1]?.slice(0,5) ?? '';
            if (s.end_time) this.endTime = s.end_time.split('T')[1]?.slice(0,5) ?? '';
            if (s.required_people) this.required_people = s.required_people;
            if (s.place) this.place = s.place;
        }
    }

    save(): void {
        if (!this.startTime || !this.endTime) {
            // minimal validation: require times
            this.modalRef.close({ error: 'missing_times' });
            return;
        }

        this.modalRef.close({
            start: this.startTime,
            end: this.endTime,
            required_people: this.required_people,
            place: this.place
        });
    }

    close(): void {
        this.modalRef.close(false);
    }
}
