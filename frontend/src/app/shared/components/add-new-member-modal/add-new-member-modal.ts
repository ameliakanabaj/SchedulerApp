import { Component, inject, OnInit } from '@angular/core';
import { DialogRef } from '@ngneat/dialog';
import { ModalHeader } from "../modal-header/modal-header/modal-header";
import { FormsModule } from "@angular/forms";

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

    organizationId = '';

    private readonly modalRef = inject(DialogRef);
    // private readonly userService = inject(User);

    ngOnInit(): void {
        this.organizationId = this.modalRef.data.organizationId;
        this.generatePassword()
    }

    addUser(): void {
        // this.userService.createUser({ firstName: this.firstName, lastName: this.lastName, email: this.email, password: this.password })
        this.firstName = '';
        this.lastName = '';
        this.password = '';
        this.email = '';
    }

    generatePassword(): void {
        const randomstring = Math.random().toString(36).slice(-8);
        console.log(randomstring);
    }

    close(): void {
        this.modalRef.close();
    }
}
