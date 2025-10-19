import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-register',
    imports: [FormsModule],
    templateUrl: './register.html',
    styleUrl: './register.css',
})
export class Register {
    email = '';
    firstName = '';
    lastName = '';
    password = '';
    confirmPassword = '';

    onRegister() {
        console.log(`${this.email}, ${this.password}`);

        if (this.password !== this.confirmPassword) {
            console.error('Passwords do not match');
            return;
        }

        // implementacja gdy bedzie backend i serwis do autoryzacji
    }
}
