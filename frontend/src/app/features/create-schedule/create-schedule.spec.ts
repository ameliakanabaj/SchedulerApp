import { CreateSchedule } from './create-schedule';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { DialogRef } from '@ngneat/dialog';
import { HttpClient } from '@angular/common/http';
import { Toastr } from '../../shared/services/toastr/toastr';

describe('CreateSchedule', () => {
    let sp: Spectator<CreateSchedule>;
    const createComponent = createComponentFactory({
        component: CreateSchedule,
        providers: [
            {
                provide: DialogRef,
                useValue: { data: { organizationId: 1 }, close: jest.fn()},
            },
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

    it('should create', () => {
        expect(sp.component).toBeTruthy();
    });
});
