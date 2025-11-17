import { Routes } from '@angular/router';
import { Login, Register, LandingPage, OrganizationsPage } from './pages';
import { AuthGuard } from './core';
import { Dashboard } from './pages/dashboard/dashboard';

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
    }
    // {
    //     path: 'organizations/:id',
    //     component: OrganizationDetailsPage,
    // }
];
