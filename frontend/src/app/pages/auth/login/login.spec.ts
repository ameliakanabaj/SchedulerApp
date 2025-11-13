import { ActivatedRoute, Router } from '@angular/router';
import { Login } from './login';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { Toastr } from '../../../shared/services/toastr/toastr';
import { of, Subject, throwError } from 'rxjs';
import { Authentication } from '../../../core/services/auth/authentication';

describe('Login', () => {
    let sp: Spectator<Login>;
    const authMock = {
        login: jest.fn()
    };
    const createComponent = createComponentFactory({
        component: Login,
        providers: [
            {
                provide: Router,
                useValue: { 
                    navigate: jest.fn(),
                    createUrlTree: jest.fn(),
                    serializeUrl: jest.fn(),
                    parseUrl: jest.fn(),
                    events: new Subject(),
                },
            },
            {
                provide: Toastr,
                useValue: {
                    success: jest.fn(),
                    error: jest.fn(),
                },
            },
            {
                provide: Authentication,
                useValue: authMock,
            },
            {
                provide: ActivatedRoute,
                useValue: {},
            }
        ]
    });

    beforeEach(() => {
        jest.clearAllMocks();
        sp = createComponent();
    });

    it('should call authService.login and navigate + show success on successful login', () => {
        const router = sp.inject(Router);
        const toastr = sp.inject(Toastr);
        const auth: any = sp.inject(Authentication);

        (auth as any).login = jest.fn().mockReturnValue(of({ token: 'mock' }));
        sp.component.email = 'user@example.com';
        sp.component.password = 'password123';

        sp.component.onLogin();

        expect(auth.login).toHaveBeenCalledWith({ email: 'user@example.com', password: 'password123' });
        expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
        expect(toastr.success).toHaveBeenCalledWith('Login succesful!');
    });

    it('should clear password and show error toastr on failed login', () => {
        const router = sp.inject(Router);
        const toastr = sp.inject(Toastr);
        const auth = sp.inject(Authentication);

        (auth as any).login = jest.fn().mockReturnValue(throwError(() => new Error('Fail')));
        sp.component.email = 'user@example.com';
        sp.component.password = 'badpass';

        sp.component.onLogin();

        expect(auth.login).toHaveBeenCalledWith({ email: 'user@example.com', password: 'badpass' });
        expect(sp.component.password).toBe('');
        expect(toastr.error).toHaveBeenCalledWith('Login failed. Please check your credentials and try again.');
        expect(router.navigate).not.toHaveBeenCalled();
    });
});
