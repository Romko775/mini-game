import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function validNumberValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    // Check if the value is a valid number
    if (value === null || value === undefined || value === '') {
      return null; // No validation error if the field is empty (optional)
    }

    const isValid = !isNaN(value) && isFinite(value) && /^\d+$/.test(value); // Check if the value is a number and finite, and contains only digits
    return isValid ? null : { invalidNumber: true }; // Return null if valid, or an error object if invalid
  };
}
