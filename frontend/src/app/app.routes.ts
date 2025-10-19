import { Routes } from '@angular/router';
import { Login, Register } from './pages';

export const routes: Routes = [
    {
        path: 'login',
        component: Login,
    },
    {
        path: 'register',
        component: Register,
    },
];
