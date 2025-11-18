import { Component, inject } from '@angular/core';
import { ModalHeader } from '../modal-header/modal-header/modal-header';
import { DialogRef } from '@ngneat/dialog';
import { FormsModule } from '@angular/forms';
import { Organization } from '@app/shared/services/organization/organization';

@Component({
  selector: 'app-organization-creation-modal',
  imports: [ModalHeader, FormsModule],
  templateUrl: './organization-creation-modal.html',
  styleUrl: './organization-creation-modal.scss',
})
export class OrganizationCreationModal {
    organizationName: string = '';

    private readonly dialogRef = inject(DialogRef);
    private readonly organizationService = inject(Organization);

    createOrganization(): void {
        this.organizationService.create(this.organizationName);
    }

    save(): void {
        this.dialogRef.close(this.organizationName);
    }

    close(): void {
        this.dialogRef.close();
    }
}
