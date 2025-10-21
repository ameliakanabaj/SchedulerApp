import { Routes } from '@angular/router';
import { Login, Register } from './pages';
import { LandingPage } from './pages/landing-page/landing-page';

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
    }
];
