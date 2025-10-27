import { Component, OnInit, Output, EventEmitter, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-nav-bar',
    standalone: true,
    imports: [NgClass, RouterLink],
    templateUrl: './nav-bar.html',
    styleUrls: ['./nav-bar.scss'],
})
export class NavBar implements OnInit {
    userAuthenticated = signal(true); // temp hardcode
    route = signal(''); // temp hardcode

    isDarkMode = signal(false);

    @Output() darkMode = new EventEmitter<boolean>();

    constructor(private activatedRoute: ActivatedRoute) {}

    ngOnInit(): void {
        const saved = localStorage.getItem('darkMode');
        this.isDarkMode.set(saved === 'true'); // initialize as boolean
        this.route.set(this.activatedRoute.snapshot.routeConfig?.path || 'dashboardWIP');
    }

    toggleDarkMode(): void {
        const next = !this.isDarkMode();
        this.isDarkMode.set(next); 
        localStorage.setItem('darkMode', String(next));
        this.darkMode.emit(next);
    }
}
