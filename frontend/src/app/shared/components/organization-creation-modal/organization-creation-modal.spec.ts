import { OrganizationCreationModal } from './organization-creation-modal';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { DialogRef } from '@ngneat/dialog';
import { HttpClient } from '@angular/common/http';
import { Toastr } from '../../services/toastr/toastr';
import { of } from 'rxjs';

describe('OrganizationCreationModal', () => {
    let sp: Spectator<OrganizationCreationModal>;
    const createComponent = createComponentFactory({
        component: OrganizationCreationModal,
        providers: [
            {
                provide: DialogRef,
                useValue: { close: jest.fn() }
            },
            {
                provide: HttpClient,
                useValue: { post: jest.fn(() => of([]))}
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
