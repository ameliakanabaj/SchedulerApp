import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { ActivatedRoute } from '@angular/router';

import { App } from './app';

describe('App', () => {
    let sp: Spectator<App>;

    const createComponent = createComponentFactory({
        component: App,
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

    it('should create', () => {
        expect(sp.component).toBeTruthy();
    });
});
