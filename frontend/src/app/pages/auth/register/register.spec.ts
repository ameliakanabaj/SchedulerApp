import { Register } from './register';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { of, Subject, throwError } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Toastr } from '../../../shared/services/toastr/toastr';
import { Authentication } from '../../../core/services/auth/authentication';

describe('Register', () => {
    let sp: Spectator<Register>;
    const authMock = {
        register: jest.fn()
    };

    const createComponent = createComponentFactory({
        component: Register,
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

    describe('onRegister', () => {
        it('should show error toastr if passwords do not match', () => {
            const toastr = sp.inject(Toastr);
            
            sp.component.registerForm.patchValue({
                password: 'Password123',
                confirmPassword: 'Password456',
            });
            
            sp.component.onRegister();

            expect(toastr.error).toHaveBeenCalledWith('Passwords do not match', 'Registration Error');
            expect(sp.component.registerForm.value.password).toBe('');
            expect(sp.component.registerForm.value.confirmPassword).toBe('');
        });

        it('should call register service and navigate to login on success', () => {
            const router = sp.inject(Router);
            const toastr = sp.inject(Toastr);
            const auth = sp.inject(Authentication);

            const registerData = {
                first_name: 'John',
                last_name: 'Doe',
                email: 'john@example.com',
                password: 'Password123'
            };

            (auth.register as unknown as jest.Mock).mockReturnValue(of({}));

            sp.component.registerForm.patchValue({
                firstName: registerData.first_name,
                lastName: registerData.last_name,
                email: registerData.email,
                password: registerData.password,
                confirmPassword: registerData.password,
            });
            

            sp.component.onRegister();

            expect(auth.register).toHaveBeenCalledWith(registerData);
            expect(router.navigate).toHaveBeenCalledWith(['/login']);
            expect(toastr.success).toHaveBeenCalledWith('Registration successful! Please log in.');
        });
    });
});
