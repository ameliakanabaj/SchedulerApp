import { Component, NgModule, OnInit, signal } from '@angular/core';
import { NavBar } from './features/unique/nav-bar/nav-bar';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-root',
    imports: [NavBar, RouterOutlet],
    templateUrl: './app.html',
    styleUrl: './app.scss',
})
export class App implements OnInit {
    private userAuthenticated = signal(false);

    constructor(
        private router: Router,
        private activatedRoute: ActivatedRoute
    ) {}

    ngOnInit(): void {
        const currRoutePath = this.activatedRoute.snapshot.routeConfig?.path;
        if (!this.userAuthenticated() && currRoutePath !== 'login' && currRoutePath !== 'register') {
            this.router.navigate(['landing']);
        } else if (this.userAuthenticated()) {
            this.router.navigate(['dashboard']);
        }

    }
}
