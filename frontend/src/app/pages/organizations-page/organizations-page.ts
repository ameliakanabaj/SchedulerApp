import { Component, inject, OnInit, signal } from '@angular/core';
import { Modal } from '@app/shared/services';
import { AddNewMemberModal, Loading, OrganizationCreationModal, UserCard } from '@app/shared/components';
import { Organization } from '@app/shared/services/organization/organization';
import { OrganizationModel } from '@app/models';

@Component({
  selector: 'app-organizations-page',
  imports: [UserCard, Loading],
  templateUrl: './organizations-page.html',
  styleUrl: './organizations-page.scss'
})
export class OrganizationsPage implements OnInit {
    organization = signal<OrganizationModel | null>(null);
    isLoading = true;
    isLoadingUsers = false;

    private readonly modalService = inject(Modal);
    private readonly organizationService = inject(Organization)

    ngOnInit(): void {
        this.getOrganization();
    }

    openCreateOrganizationModal(): void {
        const modalRef = this.modalService.openModal(OrganizationCreationModal);

        modalRef.afterClosed$.subscribe((res: any) => {
            if (res) {
                this.organization.set(res.organization);
            }
        });
    }

    openAddNewMemberModal(): void {
        const modalRef = this.modalService.openModal(AddNewMemberModal, { data: {
            organization: this.organization(),
        }});

        modalRef.afterClosed$.subscribe((res: any) => {
            if (res) {
                this.getOrganization();
            }
        });
    }

    private getOrganization(): void {
        this.organizationService.getAll().subscribe((res) => {
            if (res.length > 0) {
                this.organization.set(res[0]);
            }
        });
        this.isLoading = false;
    }
}
