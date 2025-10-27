import { Component } from '@angular/core';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-organizations-page',
  imports: [RouterLink],
  templateUrl: './organizations-page.html',
  styleUrl: './organizations-page.scss'
})
export class OrganizationsPage {
    // user = { organizations: null }; // TEMP HARDCODE
    user = { organizations: [
        { id: 1, name: 'Org 1', description: 'bla bla bla org 1' },
        { id: 2, name: 'Org 2', description: 'bla bla bla org 2', notification: 1},
    ]}
    // user = input<User>();

    leaveOrganization(orgId: number) {
        // this.organizationsService.leaveOrganization(orgId).subscribe({}); // TO DO - implement serice; add toastr
    }
}
