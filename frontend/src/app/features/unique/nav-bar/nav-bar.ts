import { Component, OnInit, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-nav-bar',
  imports: [NgClass, RouterLink],
  templateUrl: './nav-bar.html',
  styleUrl: './nav-bar.scss'
})
export class NavBar implements OnInit {
    userAuthenticated = signal(true); // temp hardcode
    route = signal('dashboard'); // temp hardcode

    constructor(
        private activatedRoute: ActivatedRoute
    ) {}

    ngOnInit(): void {
        this.route.set(this.activatedRoute.snapshot.routeConfig?.path || 'dashboard');
    }
}
