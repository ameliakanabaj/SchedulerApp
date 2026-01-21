import { Component, inject, OnInit, signal } from '@angular/core';
import { Modal } from '@app/shared/services';
import { AddNewMemberModal, OrganizationCreationModal, UserCard } from '@app/shared/components';
import { Organization } from '@app/shared/services/organization/organization';
import { OrganizationModel } from '@app/models';
import { Loading } from '@app/shared/components/loading/loading';
import { Authentication } from '@app/core';

@Component({
  selector: 'app-organizations-page',
  imports: [UserCard, Loading],
  templateUrl: './organizations-page.html',
  styleUrl: './organizations-page.scss'
})
export class OrganizationsPage implements OnInit {
    organization = signal<OrganizationModel | null>(null);
    isLoading = signal(true);
    isUserAdmin = false;

    private readonly modalService = inject(Modal);
    private readonly organizationService = inject(Organization);
    private readonly authService = inject(Authentication);

    ngOnInit(): void {
        this.getOrganization();

        if (this.authService.hasRole('ORG_ADMIN')) {
            console.log(this.isUserAdmin);
            
            this.isUserAdmin = true;
        }
    }

    openCreateOrganizationModal(): void {
        const modalRef = this.modalService.openModal(OrganizationCreationModal);

        modalRef.afterClosed$.subscribe((res: any) => {
            if (res) {
                this.getOrganization();
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
        })
    }

    getOrganization(): void {
        this.isLoading.set(true);
        this.organizationService.getAll().subscribe((res) => {
            if (res.length > 0) {
                this.organization.set(res[0]);
            }
            this.isLoading.set(false);
        });
    }
}
