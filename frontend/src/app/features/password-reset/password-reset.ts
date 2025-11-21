import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ModalHeader } from '@app/shared/components/modal-header/modal-header/modal-header';
import { Toastr, User } from '@app/shared/services';
import { DialogRef } from '@ngneat/dialog';

@Component({
  selector: 'app-password-reset',
  imports: [FormsModule, ModalHeader],
  templateUrl: './password-reset.html',
  styleUrl: './password-reset.scss',
})
export class PasswordReset {
    currPassword = '';
    newPassword = '';

    private readonly userService = inject(User);
    private readonly toastrService = inject(Toastr);
    private readonly modalRef = inject(DialogRef);

    submit(): void {
        this.userService.resetPassword(this.currPassword, this.newPassword).subscribe({
            next: (res) => {
                this.toastrService.success('Password has been changed successfully!');
            },
            error: (err) => {
                this.toastrService.error(err.statusText, 'Something went wrong!');
            }
        });
        this.modalRef.close();
    }

    close(): void {
        this.modalRef.close();
    }
}
