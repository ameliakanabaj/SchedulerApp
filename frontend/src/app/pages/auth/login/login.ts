import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-login',
    imports: [RouterLink, FormsModule],
    templateUrl: './login.html',
    styleUrl: './login.scss',
})
export class Login {
    email = '';
    password = '';

    onLogin() {
        console.log(`${this.email}, ${this.password}`);

        // implementacja gdy bedzie backend i serwis do autoryzacji
    }
}
