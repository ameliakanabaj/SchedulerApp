import { Routes } from '@angular/router';
import { Login, Register, LandingPage, OrganizationsPage, AvailabilityPage, Dashboard } from './pages';
import { AuthGuard } from './core';
import { CalendarPage } from './pages/calendar-page/calendar-page';

export const routes: Routes = [
    {
        path: 'login',
        component: Login,
    },
    {
        path: 'register',
        component: Register,
    },
    {
        path: 'landing',
        component: LandingPage,
    },
    {
        path: 'organizations',
        component: OrganizationsPage,
        canActivate: [AuthGuard],
    },
    {
        path: 'dashboard',
        component: Dashboard,
        canActivate: [AuthGuard],
    },
    {
        path: 'availability',
        component: AvailabilityPage,
        canActivate: [AuthGuard],
    },
    {
        path: 'calendar/:id',
        component: CalendarPage,
        canActivate: [AuthGuard],
    },
    {
        path: 'dashboard/:id',
        component: Dashboard,
    }
];
