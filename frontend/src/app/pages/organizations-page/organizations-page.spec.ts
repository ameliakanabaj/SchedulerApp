import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationsPage } from './organizations-page';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import { ActivatedRoute } from '@angular/router';

describe('OrganizationsPage', () => {
    let sp: Spectator<OrganizationsPage>;
    const createComp = createComponentFactory({
        component: OrganizationsPage,
        providers: [
            {
                provide: ActivatedRoute,
                useValue: {
                    snapshot: { params: { id: 1 }}
                }
            }
        ]
    });

    beforeEach(() => {
        sp = createComp();
    });

    // temp
    it('should create', () => {
        expect(sp.component).toBeTruthy();
    });

    // describe('leaveOrganization', () => {
    //     it('should call leaveOrganization method', () => {
    //         const orgId = 1;
    //         spyOn(sp.component, 'leaveOrganization');
    //         sp.component.leaveOrganization(orgId);
    //         expect(sp.component.leaveOrganization).toHaveBeenCalledWith(orgId);
    //     });
    // });
});
