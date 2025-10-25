import { Component } from '@angular/core';

@Component({
  selector: 'app-organizations-page',
  imports: [],
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

}
