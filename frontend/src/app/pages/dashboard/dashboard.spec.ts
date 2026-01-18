import { Dashboard } from './dashboard';
import { createComponentFactory, Spectator } from '@ngneat/spectator';

import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Toastr } from '../../shared/services/toastr/toastr';
import { User } from '../../shared/services/user/user';
import { of } from 'rxjs';
import { Shift } from '../../shared/services/shift/shift';

describe('Dashboard', () => {
    let sp: Spectator<Dashboard>;
    const mockHttpClient = {
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
    };
    const mockUserService = {
        getById: jest.fn().mockReturnValue(of({ user_id: 1, first_name: 'Test', last_name: 'User' })),
    };
    const mockShiftService = {
        getMyShifts: jest.fn().mockReturnValue(of([])),
    };
    const createComponent = createComponentFactory({
        component: Dashboard,
        providers: [
            { provide: ActivatedRoute, useValue: {}},
            { provide: HttpClient, useValue: mockHttpClient},
            { provide: Toastr, useValue: {}},
            { provide: User, useValue: mockUserService },
            { provide: Shift, useValue: mockShiftService },
        ]
    });

    beforeEach(() => {
        sp = createComponent();
    });

    it('test', () => {
        expect(true).toBeTruthy();
    });
});
