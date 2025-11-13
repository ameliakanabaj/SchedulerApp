import { Component, inject } from '@angular/core';
import { ModalHeader } from '../modal-header/modal-header/modal-header';
import { DialogRef } from '@ngneat/dialog';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-organization-creation-modal',
  imports: [ModalHeader, FormsModule],
  templateUrl: './organization-creation-modal.html',
  styleUrl: './organization-creation-modal.scss',
})
export class OrganizationCreationModal {
    organizationName: string = '';

    private readonly dialogRef = inject(DialogRef);

    createOrganization(): void {
        const newOrganization = { id: 1, name: this.organizationName }; // CZEKAM NA BACKEND
    }

    save(): void {
        this.dialogRef.close(this.organizationName);
    }

    close(): void {
        this.dialogRef.close();
    }
}
