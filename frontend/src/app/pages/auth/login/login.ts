import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Authentication } from '@app/core';

@Component({
    selector: 'app-login',
    imports: [RouterLink, FormsModule],
    templateUrl: './login.html',
    styleUrl: './login.scss',
})
export class Login {
    email = '';
    password = '';

    constructor(
        // private toastr: Toastr TO IMPLEMENT ONCE ADDED
        private router: Router,
        private authService: Authentication,
    ) {}

    onLogin() {
        this.authService.login({ email: this.email, password: this.password }).subscribe({
            next: (res) => {
                this.router.navigate(['/dashboard']);
                // this.toastr.success('Login succesful!')
            },
            error: (err) => {
                console.error('Login failed', err);
                this.password = '';
                // this.toastr.error('Login failed. Please check your credentials and try again.');
            }
        });
    }
}
