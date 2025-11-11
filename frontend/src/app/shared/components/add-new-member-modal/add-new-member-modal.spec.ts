
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { AddNewMemberModal } from './add-new-member-modal';
import { DialogRef } from '@ngneat/dialog';

describe('AddNewMemberModal', () => {
    let sp: Spectator<AddNewMemberModal>;
    const createComponent = createComponentFactory({
        component: AddNewMemberModal,
        providers: [
            {
                provide: DialogRef,
                useValue: {
                    data: {
                        organizationId: 1,
                    }
                }
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
            sp.component.firstName = 'Wladyslaw';
            sp.component.lastName = 'Mjotk';
            sp.component.password = 'jaCieAleKochamZabrzePolnocne1';
            sp.component.email = 'aveAve';

            sp.component.addUser();

            expect(sp.component.firstName).toBeFalsy();
            expect(sp.component.lastName).toBeFalsy();
            expect(sp.component.password).toBeFalsy();
            expect(sp.component.email).toBeFalsy();
        })
    });
});
