import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-login',
    imports: [RouterLink],
    templateUrl: './login.html',
    styleUrl: './login.css',
})
export class Login {
    email = signal('');
    password = signal('');

    onLogin() {
        // implementacja gdy bedzie backend i serwis do autoryzacji
    }
}
