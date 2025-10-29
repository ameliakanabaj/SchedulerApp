import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { Toastr } from '@app/shared/services';

@Component({
    selector: 'app-register',
    imports: [FormsModule, RouterLink],
    templateUrl: './register.html',
    styleUrl: './register.scss',
})
export class Register {
    private readonly toastr = inject(Toastr);

    email = '';
    firstName = '';
    lastName = '';
    password = '';
    confirmPassword = '';

    onRegister() {
        console.log(`${this.email}, ${this.password}`);

        if (this.password !== this.confirmPassword) {
            this.toastr.error('Passwords do not match', 'Registration Error');
            return;
        }

        this.toastr.success('Registration successful', 'Welcome!');
        // implementacja gdy bedzie backend i serwis do autoryzacji
    }
}
