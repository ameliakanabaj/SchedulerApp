import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from "@angular/router";
import { Modal, Toastr } from '@app/shared/services';
import { AddNewMemberModal, OrganizationCreationModal, UserCard } from '@app/shared/components';

@Component({
  selector: 'app-organizations-page',
  imports: [UserCard],
  templateUrl: './organizations-page.html',
  styleUrl: './organizations-page.scss'
})
export class OrganizationsPage implements OnInit {
    userOrganization = signal(true);
    organization = {
        name: 'Test org',
    }

    private readonly modalService = inject(Modal);
    private readonly toastr = inject(Toastr);

    ngOnInit(): void {
        // this.organizationService.getUserOrganization().then(org => {  CZEKAM NA BACKEND
        //     this.userOrganization.set(org);
        // })
    }


    openCreateOrganizationModal(): void {
        const modalRef = this.modalService.openModal(OrganizationCreationModal);

        modalRef.afterClosed$.subscribe((res: any) => {
            if (res) {
                this.toastr.success('Organization created successfully!');
                // this.userOrganization.set(res); CZEKAM NA BACKEND
            }
        })
    }

    openAddNewMemberModal(): void {
        // this.modalService.openModal(AddNewMemberModal, { data: {
        //     // organizationId: this.organizationId
        // }});
        this.modalService.openModal(AddNewMemberModal, {  });
    }
}
