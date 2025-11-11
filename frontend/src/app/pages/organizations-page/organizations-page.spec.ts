import { OrganizationsPage } from './organizations-page';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { DialogService } from '@ngneat/dialog';
import { Toastr } from '../../shared/services/toastr/toastr';
import { Modal } from '../../shared/services/modal/modal';

describe('OrganizationsPage', () => {
    let sp: Spectator<OrganizationsPage>;
    const createComponent = createComponentFactory({
        component: OrganizationsPage,
        providers: [
            {
                provide: Toastr,
                useValue: {
                    success: jest.fn(),
                    error: jest.fn(),
                }
            },
            {
                provide: Modal,
                useValue: { openModal: jest.fn() }
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
    })

    describe('openAddNewMemberModal', () => {
        it('should call openAddNewMemberModal', () => {
            const modal = sp.inject(Modal);

            sp.component.openAddNewMemberModal();

            expect(modal.openModal).toHaveBeenCalled();
        });
    });
});
