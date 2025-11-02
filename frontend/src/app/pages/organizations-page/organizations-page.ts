import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from "@angular/router";
import { Modal, Toastr } from '@app/shared/services';
import { OrganizationCreationModal } from '@app/shared/components/organization-creation-modal/organization-creation-modal';

@Component({
  selector: 'app-organizations-page',
  imports: [],
  templateUrl: './organizations-page.html',
  styleUrl: './organizations-page.scss'
})
export class OrganizationsPage implements OnInit {
    user = { organizations: null }; // TEMP HARDCODE
    userOrganization = signal(null);

    private readonly modalService = inject(Modal);
    private readonly toastr = inject(Toastr);

    ngOnInit(): void {
        // this.organizationService.getUserOrganization().then(org => {  CZEKAM NA BACKEND
        //     this.userOrganization.set(org);
        // })
    }


    openCreateOrganizationModal() {
        const modalRef = this.modalService.openModal(OrganizationCreationModal);

        modalRef.afterClosed().subscribe((res: any) => {
            if (res) {
                this.toastr.success('Organization created successfully!');
                // this.userOrganization.set(res); CZEKAM NA BACKEND
            }
        })
    }
}
