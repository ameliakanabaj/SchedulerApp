import { Component, inject, input, OnInit, output } from '@angular/core';
import { Authentication } from '@app/core';
import { UserModel } from '@app/models';
import { Toastr, User } from '@app/shared/services';

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
    private readonly toastr = inject(Toastr);

    ngOnInit(): void {
        this.isUserAdmin = this.authService.hasRole('ORG_ADMIN');
    }

    removeUser(userId: number): void {
        this.userService.delete(userId).subscribe(() => {
            this.toastr.success('User removed successfully.');
            this.removed.emit();
        });
    }

    isNotCurrentUser(user: UserModel): boolean {
        return this.authService.getUserId() != String(user?.user_id);
    }
}
