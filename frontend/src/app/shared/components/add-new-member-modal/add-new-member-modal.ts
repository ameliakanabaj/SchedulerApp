import { Component, inject, OnInit } from '@angular/core';
import { DialogRef } from '@ngneat/dialog';
import { ModalHeader } from "../modal-header/modal-header/modal-header";
import { FormsModule } from "@angular/forms";
import { Toastr, User } from '@app/shared/services';

@Component({
  selector: 'app-add-new-member-modal',
  imports: [ModalHeader, FormsModule],
  templateUrl: './add-new-member-modal.html',
  styleUrl: './add-new-member-modal.scss',
})
export class AddNewMemberModal implements OnInit {
    firstName = '';
    lastName = '';
    email = '';
    password = '';

    organizationId?: number = undefined;

    private readonly modalRef = inject(DialogRef);
    private readonly userService = inject(User);
    private readonly toastrService = inject(Toastr);

    ngOnInit(): void {
        this.organizationId = this.modalRef.data.organization.organization_id;
    }

    addUser(): void {
        this.userService.create({ organization_id: this.organizationId, first_name: this.firstName, last_name: this.lastName, email: this.email, password: this.password, role: 'EMPLOYEE' }).subscribe(({
            next: (res: any) => {
                this.toastrService.success('Succsessfully created new member!')
            },
            error: (err: any) => {
                this.toastrService.error(err.statusText, 'Something went wrong! Try again later')
            }
        }));
        this.modalRef.close('save');
    }

    close(): void {
        this.modalRef.close();
    }
}
