import { Component, input } from '@angular/core';
import { RouterLink } from "@angular/router";
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-sign-in',
  imports: [RouterLink, NgClass],
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.scss'
})
export class SignIn {
    xl = input(false);

}
