import { Component, inject } from '@angular/core';
import { DialogRef } from '@ngneat/dialog';

interface RemoveUserConfirmationData {
    fullName: string;
}

@Component({
    selector: 'app-remove-user-confirmation-modal',
    templateUrl: './remove-user-confirmation-modal.html',
    styleUrl: './remove-user-confirmation-modal.scss'
})
export class RemoveUserConfirmationModal {
    readonly ref = inject(DialogRef<RemoveUserConfirmationData, boolean>);
    readonly data = this.ref.data;
}
