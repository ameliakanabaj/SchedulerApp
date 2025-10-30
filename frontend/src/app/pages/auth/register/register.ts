import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Toastr } from '@app/shared/services';
import { Authentication } from '@app/core';

@Component({
    selector: 'app-register',
    imports: [FormsModule],
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

    constructor(
        private router: Router,
        private authService: Authentication,
        // private toastr: Toastr ADD LATER ONCE ADDED
    ) {}

    onRegister() {
        if (this.password !== this.confirmPassword) {
            this.toastr.error('Passwords do not match', 'Registration Error');
            this.password = '';
            this.confirmPassword = '';
            return;
        }

        this.authService.register({
            first_name: this.firstName,
            last_name: this.lastName,
            email: this.email,
            password: this.password,
        }).subscribe({
            next: (res) => {
                this.router.navigate(['/login']);
                this.toastr.success('Registration successful! Please log in.');
            },
            error: (err) => {
                console.error('Registration failed', err);
                this.password = '';
                this.confirmPassword = '';
                this.toastr.error('Registration failed. Please try again.');
            },
        })
    }
}
