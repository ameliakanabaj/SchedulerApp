import { Routes } from '@angular/router';
import { Login, Register, LandingPage } from './pages';

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
