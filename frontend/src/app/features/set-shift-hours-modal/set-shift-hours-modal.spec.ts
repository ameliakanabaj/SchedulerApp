import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetShiftHoursModal } from './set-shift-hours-modal';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { DialogRef } from '@ngneat/dialog';

describe('SetShiftHoursModal', () => {
    let sp: Spectator<SetShiftHoursModal>;
    const createComponent = createComponentFactory({
        component: SetShiftHoursModal,
        providers: [
            { provide: DialogRef, useValue: {}}
        ],
    });

    beforeEach(() => {
        sp = createComponent();
    });

    it('should create', () => {
        expect(sp.component).toBeTruthy();
    });
});
