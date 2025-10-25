import { Routes } from '@angular/router';
import { Login, Register, LandingPage, OrganizationsPage } from './pages';

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
    }
];
