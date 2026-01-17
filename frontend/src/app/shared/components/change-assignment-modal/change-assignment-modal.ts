import { Component, inject, OnInit } from '@angular/core';
import { AssignmentModel, UserModel } from '@app/models';
import { Toastr, User } from '@app/shared/services';
import { Assignment } from '@app/shared/services/assignment/assignment';
import { DialogRef } from '@ngneat/dialog';
import { ModalHeader } from '../modal-header/modal-header/modal-header';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-change-assignment-modal',
  imports: [ModalHeader, FormsModule],
  templateUrl: './change-assignment-modal.html',
  styleUrls: ['./change-assignment-modal.scss'],
})
export class ChangeAssignmentModal implements OnInit {
    orgId?: number;
    assignment!: AssignmentModel;

    users: UserModel[] = [];

    private readonly dialogRef = inject(DialogRef);
    private readonly assignementService = inject(Assignment);
    private readonly userService = inject(User);
    private readonly toastrService = inject(Toastr);
    
    ngOnInit(): void {
        this.orgId = this.dialogRef.data.orgId;
        this.assignment = this.dialogRef.data.assignment;

        this.userService.getByOrganization(this.orgId ?? 0).subscribe(users => {
            this.users = users;
            console.log(users);
            
        });
    }

    updateAssignment(): void {
        console.log(this.assignment);
        
        this.assignementService.updateAssignment(this.assignment.assignment_id, {
            user_id: this.assignment.user_id
        }).subscribe({
            next: () => {
                this.toastrService.success('Assignment updated successfully');
                this.close();
            },
            error: (err) => {
                this.toastrService.error('Failed to update assignment: ' + err.message);
                console.log(err);
                
            }
        });
    }

    close(): void {
        this.dialogRef.close();
    }
}
