import { Component, inject } from '@angular/core';
import { DialogRef } from '@ngneat/dialog';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  templateUrl: './confirm-modal.html',
  styleUrls: ['./confirm-modal.scss']
})
export class ConfirmModal {
  public ref = inject(DialogRef);
  public data = this.ref.data;
}
