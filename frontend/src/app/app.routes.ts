import { Routes } from '@angular/router';
import { Login, Register, LandingPage, OrganizationsPage } from './pages';
import { AuthGuard } from './core';

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
    // {
    //     path: 'organizations/:id',
    //     component: OrganizationDetailsPage,
    // }
];
