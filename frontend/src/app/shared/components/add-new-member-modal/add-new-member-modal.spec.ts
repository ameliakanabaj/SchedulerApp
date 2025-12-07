
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { AddNewMemberModal } from './add-new-member-modal';
import { DialogRef } from '@ngneat/dialog';
import { HttpClient } from '@angular/common/http';
import { Toastr } from '../../services/toastr/toastr';
import { of } from 'rxjs';

describe('AddNewMemberModal', () => {
    let sp: Spectator<AddNewMemberModal>;
    const createComponent = createComponentFactory({
        component: AddNewMemberModal,
        providers: [
            {
                provide: DialogRef,
                useValue: { close: jest.fn(), data: {
                    organization: {
                        organization_id: 1,
                        name: 'TestOrg',
                    }
                }}
            },
            {
                provide: HttpClient,
                useValue: {
                    post: jest.fn().mockReturnValue(of()),
                }
            },
            {
                provide: Toastr,
                useValue: {},
            }
        ]
    })

    beforeEach(() => {
        sp = createComponent();
    })

    describe('onInit', () => {
        it('should correctly set organizationId from dialogRef', () => {
            sp.component.ngOnInit();

            expect(sp.component.organizationId).toBe(1);
        });
    });

    describe('addUser', () => {
        it('should send API request and clear out form', () => {
            sp.component.addUser();
        });
    });
});
