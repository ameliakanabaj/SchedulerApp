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
    organization = signal<OrganizationModel | null>(null);

    private readonly modalService = inject(Modal);
    private readonly toastr = inject(Toastr);
    private readonly organizationService = inject(Organization)

    ngOnInit(): void {
        this.organizationService.getAll().subscribe((res) => {
            if (res.length > 0) {
                this.organization.set(res[0]);
            }
        });
    }

    openCreateOrganizationModal(): void {
        const modalRef = this.modalService.openModal(OrganizationCreationModal);

        modalRef.afterClosed$.subscribe((res: any) => {
            if (res) {
                this.toastr.success('Organization created successfully!');
                this.organization.set(res);
            }
        });
    }

    openAddNewMemberModal(): void {
        this.modalService.openModal(AddNewMemberModal, { data: {
            organizationId: this.organization()!.id,
        }});
    }
}
