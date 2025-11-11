import { Component, signal, OnInit } from '@angular/core';
import { Router, RouterLink } from "@angular/router";
import { SignIn } from '@app/shared/buttons/sign-in/sign-in';
import { SignUp } from '@app/shared/buttons/sign-up/sign-up';
import { Calendar } from "@app/shared/components/calendar/calendar";

@Component({
  selector: 'app-landing-page',
  imports: [SignIn, SignUp, RouterLink, Calendar],
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
