import { Component, signal, OnInit } from '@angular/core';
import { Router, RouterLink } from "@angular/router";
import { SignIn } from '@app/shared/buttons/sign-in/sign-in';
import { SignUp } from '@app/shared/buttons/sign-up/sign-up';

@Component({
  selector: 'app-landing-page',
  imports: [SignIn, SignUp, RouterLink],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.scss'
})
export class LandingPage implements OnInit {
    userAuthenticated = signal(false);

    constructor(private router: Router) {}

    ngOnInit(): void {
        if (this.userAuthenticated()) {
            this.router.navigate(['/dashboard']);
        }
    }
}
