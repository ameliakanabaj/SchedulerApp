import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationCreationModal } from './organization-creation-modal';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { DialogRef } from '@ngneat/dialog';

describe('OrganizationCreationModal', () => {
    let sp: Spectator<OrganizationCreationModal>;
    const createComponent = createComponentFactory({
        component: OrganizationCreationModal,
        providers: [
            {
                provide: DialogRef,
                useValue: {
                    close: jest.fn();
                }
            }
        ]
    });

    beforeEach(() => {
        sp = createComponent();
    });

    describe('createOrganization', () => {
        // api req
    });

    describe('save', () => {
        it('should close modal with organization name', () => {
            const modal = sp.inject(DialogRef);

            sp.component.save();

            expect(modal.close).toHaveBeenCalledWith(sp.component.organizationName);
        });
    });

    describe('close', () => {
        it('should close modal', () => {
            const modal = sp.inject(DialogRef);

            sp.component.close();

            expect(modal.close).toHaveBeenCalled();
        });
    });
});
