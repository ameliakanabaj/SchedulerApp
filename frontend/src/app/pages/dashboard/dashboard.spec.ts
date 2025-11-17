import { Dashboard } from './dashboard';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { ActivatedRoute } from '@angular/router';

describe('Dashboard', () => {
    let sp: Spectator<Dashboard>;
    const createComponent = createComponentFactory({
        component: Dashboard,
        providers: [
            { provide: ActivatedRoute, useValue: {}}
        ]
    });

    beforeEach(() => {
        sp = createComponent();
    });

    it('test', () => {
        expect(true).toBeTruthy();
    });
});
