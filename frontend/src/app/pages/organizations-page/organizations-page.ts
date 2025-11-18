import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { Modal, Toastr } from '@app/shared/services';
import { AddNewMemberModal, OrganizationCreationModal, UserCard } from '@app/shared/components';
import { Organization } from '@app/shared/services/organization/organization';
import { Organization as OrganizationModel } from '@app/models';

@Component({
  selector: 'app-organizations-page',
  imports: [UserCard],
  templateUrl: './organizations-page.html',
  styleUrl: './organizations-page.scss'
})
export class OrganizationsPage implements OnInit {
    userOrganization = signal<OrganizationModel | null>(null);
    userOrganizationMembers? = signal<string[]>([])

    private readonly modalService = inject(Modal);
    private readonly toastr = inject(Toastr);
    private readonly organizationService = inject(Organization)

    ngOnInit(): void {
        this.organizationService.getAll().subscribe((res) => {
            if (res.length > 0) {
                this.userOrganization.set(res[0]);
            }
        });
    }


    openCreateOrganizationModal(): void {
        const modalRef = this.modalService.openModal(OrganizationCreationModal);

        modalRef.afterClosed$.subscribe((res: any) => {
            if (res) {
                this.toastr.success('Organization created successfully!');
                this.userOrganization.set(res);
                this.userOrganizationMembers?.set(res.users);
            }
        });
    }

    openAddNewMemberModal(): void {
        // this.modalService.openModal(AddNewMemberModal, { data: {
        //     organizationId: this.organizationId
        // }});
        this.modalService.openModal(AddNewMemberModal, {  });
    }
}
