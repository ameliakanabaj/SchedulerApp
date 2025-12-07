import { Component, OnInit, Output, EventEmitter, signal, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { Authentication } from '@app/core';

@Component({
    selector: 'app-nav-bar',
    standalone: true,
    imports: [NgClass, RouterLink],
    templateUrl: './nav-bar.html',
    styleUrls: ['./nav-bar.scss'],
})
export class NavBar implements OnInit {
    userAuthenticated = signal(false);
    route = signal('');

    isDarkMode = signal(false);

    @Output() darkMode = new EventEmitter<boolean>();

    private readonly authService = inject(Authentication);
    private readonly activatedRoute = inject(ActivatedRoute);

    ngOnInit(): void {
        this.isDarkMode.set(true);
        this.userAuthenticated.set(this.authService.isAuthenticated());
        this.route.set(this.activatedRoute.snapshot.routeConfig?.path ?? '');
    }

    toggleDarkMode(): void {
        const next = !this.isDarkMode();
        this.isDarkMode.set(next); 
        localStorage.setItem('darkMode', String(next));
        this.darkMode.emit(next);
    }

    logout(): void {
        this.authService.logout();
        location.reload();
    }
}
