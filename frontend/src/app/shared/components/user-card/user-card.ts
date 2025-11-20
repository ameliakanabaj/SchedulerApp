import { Component, input } from '@angular/core';
import { UserModel } from '@app/models';

@Component({
  selector: 'app-user-card',
  imports: [],
  templateUrl: './user-card.html',
  styleUrl: './user-card.scss',
})
export class UserCard {
    user = input<UserModel>();
}
