import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogRef } from '@ngneat/dialog';
import { ModalHeader } from '../modal-header/modal-header/modal-header';

@Component({
  selector: 'app-set-custom-hours-modal',
  imports: [FormsModule, ModalHeader],
  templateUrl: './set-custom-hours-modal.html',
  styleUrl: './set-custom-hours-modal.scss',
})
export class SetCustomHoursModal {
    startTime = '';
    endTime = '';

    private readonly modalRef = inject(DialogRef);

    saveHours(): void {
        this.modalRef.close({ startTime: this.startTime, endTime: this.endTime});
    }

    closeModal(): void {
        this.modalRef.close();
    }
}
