import { Dashboard } from './dashboard';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Toastr } from '../../shared/services/toastr/toastr';

describe('Dashboard', () => {
    let sp: Spectator<Dashboard>;
    const createComponent = createComponentFactory({
        component: Dashboard,
        providers: [
            { provide: ActivatedRoute, useValue: {}},
            { provide: HttpClient, useValue: {}},
            { provide: Toastr, useValue: {}}
        ]
    });

    beforeEach(() => {
        sp = createComponent();
    });

    it('test', () => {
        expect(true).toBeTruthy();
    });
});
