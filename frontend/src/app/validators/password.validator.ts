import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function passwordStrengthValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as string;

    if (!value) {
      return null; 
    }

    const hasMinLength = value.length >= 8;
    const hasUpperCase = /[A-Z]/.test(value);
    const hasNumber = /\d/.test(value);

    const passwordValid = hasMinLength && hasUpperCase && hasNumber;

    return passwordValid
      ? null
      : {
          passwordStrength: {
            minLength: hasMinLength,
            upperCase: hasUpperCase,
            number: hasNumber,
          },
        };
  };
}
