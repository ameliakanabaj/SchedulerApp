import { Spectator, createComponentFactory } from '@ngneat/spectator';
import { ActivatedRoute } from '@angular/router';

import { NavBar } from './nav-bar';

describe('NavBar', () => {
    let sp: Spectator<NavBar>;
    const createComponent = createComponentFactory({
        component: NavBar,
        providers: [
            {
                provide: ActivatedRoute,
                useValue: { snapshot: { routeConfig: { path: 'dashboard' } } },
            },
        ],
    });

    beforeEach(() => {
        sp = createComponent();
    });

    describe('ngOnInit', () => {
        it('should properly set route and other signals', () => {
            sp.component.ngOnInit();
            expect(sp.component.route()).toBe('dashboard');
        });
    });
});
