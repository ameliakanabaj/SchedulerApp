import { Component, inject } from '@angular/core';
import { ModalHeader } from '../modal-header/modal-header/modal-header';
import { FormsModule } from '@angular/forms';
import { DialogRef } from '@ngneat/dialog';

@Component({
  selector: 'app-add-notes-modal',
  imports: [ModalHeader, FormsModule],
  templateUrl: './add-notes-modal.html',
  styleUrl: './add-notes-modal.scss',
})
export class AddNotesModal {
    note: string = '';

    private readonly modalRef = inject(DialogRef);

    close(): void {
        this.modalRef.close();
    }

    submit(): void {
        this.modalRef.close(this.note);
    }
}
