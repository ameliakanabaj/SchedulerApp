import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNotesModal } from './add-notes-modal';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { DialogRef } from '@ngneat/dialog';

describe('AddNotesModal', () => {
    let sp: Spectator<AddNotesModal>;
    const createComponent = createComponentFactory({
        component: AddNotesModal,
        providers: [
            {
                provide: DialogRef,
                useValue: { close: jest.fn() }
            }
        ]
    });

    beforeEach(() => {
        sp = createComponent();
    });

    describe('save', () => {
        it('should submit', () => {
            sp.component.submit();

            expect(sp.component['modalRef'].close).toHaveBeenCalled();
        });
    });
});
