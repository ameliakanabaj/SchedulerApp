import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgClass } from '@angular/common';

@Component({
    selector: 'app-sign-up',
    imports: [RouterLink, NgClass],
    templateUrl: './sign-up.html',
    styleUrl: './sign-up.scss'
})
export class SignUp {
    xl = input(false);
}
