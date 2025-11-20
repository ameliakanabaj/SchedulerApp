import { Component, signal, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from "@angular/router";
import { Authentication } from '@app/core';
import { SignIn } from '@app/shared/buttons/sign-in/sign-in';
import { SignUp } from '@app/shared/buttons/sign-up/sign-up';

@Component({
  selector: 'app-landing-page',
  imports: [SignIn, SignUp, RouterLink],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.scss'
})
export class LandingPage implements OnInit {

    private readonly router = inject(Router);
    private readonly authService = inject(Authentication);

    ngOnInit(): void {
        if (this.authService.isAuthenticated()) {
            this.router.navigate(['/dashboard']);
        }
    }
}
