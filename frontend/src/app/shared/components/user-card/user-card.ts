import { Component, inject, input, OnInit, output } from '@angular/core';
import { Authentication } from '@app/core';
import { UserModel } from '@app/models';
import { Modal, Toastr, User } from '@app/shared/services';
import { RemoveUserConfirmationModal } from '../remove-user-confirmation-modal/remove-user-confirmation-modal';

@Component({
  selector: 'app-user-card',
  imports: [],
  templateUrl: './user-card.html',
  styleUrl: './user-card.scss',
})
export class UserCard implements OnInit {
    user = input<UserModel>();
    removed = output<void>();
    isUserAdmin = false;

    private readonly authService = inject(Authentication);
    private readonly userService = inject(User);
    private readonly modalService = inject(Modal);
    private readonly toastr = inject(Toastr);

    ngOnInit(): void {
        this.isUserAdmin = this.authService.hasRole('ORG_ADMIN');
    }

    removeUser(user: UserModel): void {
        const fullName = `${user.first_name} ${user.last_name}`.trim();
        const modalRef = this.modalService.openModal(RemoveUserConfirmationModal, {
            data: { fullName }
        });

        modalRef.afterClosed$.subscribe((confirmed: boolean) => {
            if (!confirmed) {
                return;
            }

            this.userService.delete(user.user_id).subscribe(() => {
                this.toastr.success('User removed successfully.');
                this.removed.emit();
            });
        });
    }

    isNotCurrentUser(user: UserModel): boolean {
        return this.authService.getUserId() != String(user?.user_id);
    }
}
