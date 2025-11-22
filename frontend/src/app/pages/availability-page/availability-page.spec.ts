import { HttpClient } from '@angular/common/http';
import { AvailabilityPage } from './availability-page';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { Toastr } from '../../shared/services/toastr/toastr';

describe('AvailabilityPage', () => {
    let sp: Spectator<AvailabilityPage>;
    const createComponent = createComponentFactory({
        component: AvailabilityPage,
        providers: [
            {
                provide: HttpClient,
                useValue: {},
            },
            {
                provide: Toastr,
                useValue: {},
            }
        ]
    });

    beforeEach(() => {
        sp = createComponent();
    });

    describe('init', () => {
        it('should create', () => {
            expect(sp).not.toBeNull();
        });
    });
});
