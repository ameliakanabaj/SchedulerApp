import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { OrganizationsPage } from './organizations-page';
import { Toastr } from '../../shared/services/toastr/toastr';
import { Modal } from '../../shared/services/modal/modal';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { signal } from '@angular/core';

describe('OrganizationsPage', () => {
    let sp: Spectator<OrganizationsPage>;

    const createComponent = createComponentFactory({
        component: OrganizationsPage,
        providers: [
        {
            provide: Toastr,
            useValue: { success: jest.fn(), error: jest.fn() }
        },
        {
            provide: Modal,
            useValue: {
            openModal: jest.fn(() => ({
                afterClosed$: of([])
            }))
            }
        },
        {
            provide: HttpClient,
            useValue: { get: jest.fn(() => of([])) }
        }
        ]
    });

    beforeEach(() => {
        sp = createComponent();
    });

    describe('openCreateOrganizationModal', () => {
        it('should call openCreateOrganizationModal', () => {
        const modal = sp.inject(Modal);

        sp.component.openCreateOrganizationModal();

        expect(modal.openModal).toHaveBeenCalled();
        });
    });

    describe('openAddNewMemberModal', () => {
        it('should call openAddNewMemberModal', () => {
            const modal = sp.inject(Modal);
            sp.component.organization = signal({ id: 1, name: 'TestOrg' });

            sp.component.openAddNewMemberModal();

            expect(modal.openModal).toHaveBeenCalledWith(
                expect.any(Function),
                { data: { organizationId: 1 } }
            );
        });
    });
});
