import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Toastr } from '@app/shared/services';
import { Authentication } from '@app/core';
import { passwordStrengthValidator } from 'app/validators/password.validator';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {
  private readonly toastr = inject(Toastr);
  private readonly fb = inject(FormBuilder);

  constructor(
    private router: Router,
    private authService: Authentication,
  ) {}

  registerForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    password: [
      '',
      [
        Validators.required,
        passwordStrengthValidator(),
      ],
    ],
    confirmPassword: ['', Validators.required],
  });

  onRegister() {
    if (this.registerForm.invalid) {
      return;
    }

    const { password, confirmPassword } = this.registerForm.value;

    if (password !== confirmPassword) {
      this.toastr.error('Passwords do not match', 'Registration Error');
      this.registerForm.patchValue({
        password: '',
        confirmPassword: '',
      });
      return;
    }

    this.authService
      .register({
        first_name: this.registerForm.value.firstName!,
        last_name: this.registerForm.value.lastName!,
        email: this.registerForm.value.email!,
        password: password!,
      })
      .subscribe({
        next: () => {
          this.router.navigate(['/login']);
          this.toastr.success('Registration successful! Please log in.');
        },
        error: (err) => {
          this.registerForm.patchValue({
            password: '',
            confirmPassword: '',
          });
          this.toastr.error(err.statusText, 'Registration Failed');
        },
      });
  }


  public get passwordControl(): FormControl<string | null> {
    return this.registerForm.controls.password;
  }

  public get emailControl(): FormControl<string | null> {
    return this.registerForm.controls.email;
  }
  
  public get firstNameControl(): FormControl<string | null> {
    return this.registerForm.controls.firstName;
  }

  public get lastNameControl(): FormControl<string | null> {
    return this.registerForm.controls.lastName;
  }

  public get confirmPasswordControl(): FormControl<string | null> {
    return this.registerForm.controls.confirmPassword;
  }
}
