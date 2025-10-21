import { Router } from '@angular/router';
import { LandingPage } from './landing-page';
import { createComponentFactory, Spectator } from '@ngneat/spectator';

describe('LandingPage', () => {
    let sp: Spectator<LandingPage>;
    const createComponent = createComponentFactory({
        component: LandingPage,
    })

    beforeEach(() => {
        sp = createComponent();
    });

    describe('ngOnInit', () => {
        it('should navigate to /dasboard', () => {
            sp.component.userAuthenticated.set(false);

            sp.component.ngOnInit();

            expect(sp.inject(Router).navigate).not.toHaveBeenCalledWith(['/dashboard']);
        });
    });
});
