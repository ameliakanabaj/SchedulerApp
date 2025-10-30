import { ActivatedRoute } from '@angular/router';
import { Register } from './register';
import { Toastr as ToastrService } from '../../../shared/services/toastr/toastr';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { HttpClient } from '@angular/common/http';

describe('Register', () => {
    let sp: Spectator<Register>;
    let toastrService: ToastrService;

    const createComponent = createComponentFactory({
        component: Register,
        providers: [
            {
                provide: ToastrService,
                useValue: {
                    success: jest.fn(),
                    error: jest.fn(),
                },
            },
            {
                provide: ActivatedRoute,
                useValue: { snapshot: { queryParams: {} } }
            },
            {
                provide: HttpClient,
                useValue: {}
            }
        ]
    })
    beforeEach(() => {
        sp = createComponent();
        toastrService = sp.inject(ToastrService);
    });

    describe('onRegister', () => {
        it('should show error toastr if passwords do not match', () => {
            sp.component.password = 'password123';
            sp.component.confirmPassword = 'password456';

            sp.component.onRegister();

            expect(toastrService.error).toHaveBeenCalledWith('Passwords do not match', 'Registration Error');
        });
        it('should properly send register data', () => {  // TO-DO
            sp.component.email = '';
            sp.component.password = '';
        });
    });
});
