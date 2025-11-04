import { Spectator, createComponentFactory } from '@ngneat/spectator';
import { ActivatedRoute } from '@angular/router';

import { NavBar } from './nav-bar';
import { HttpClient } from '@angular/common/http';
import { Authentication } from '../../../core/services/auth/authentication';

describe('NavBar', () => {
    let sp: Spectator<NavBar>;
    const createComponent = createComponentFactory({
        component: NavBar,
        providers: [
            {
                provide: ActivatedRoute,
                useValue: { snapshot: { routeConfig: { path: 'dashboard' } } },
            },
            {
                provide: HttpClient,
                useValue: {},
            },
            {
                provide: Authentication,
                useValue: {
                    isAuthenticated: jest.fn();
                }
            }
        ]
    });

    beforeEach(() => {
        sp = createComponent();
    });

    describe('ngOnInit', () => {
        it('should call auth service', () => {
            const authService = sp.inject(Authentication);
            sp.component.ngOnInit();

            expect(authService.isAuthenticated).toHaveBeenCalled();
        });
    });
});