import { Component, input } from '@angular/core';

@Component({
  selector: 'app-modal-header',
  imports: [],
  templateUrl: './modal-header.html',
  styleUrl: './modal-header.scss',
})
export class ModalHeader {
    title = input('');
}
