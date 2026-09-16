import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../../core/services';
import { toErrorMessage } from '../../../shared/utils/api-error';
import {
  PASSWORD_HINT,
  passwordValidators,
} from '../../../shared/utils/password.validators';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  public readonly passwordHint = PASSWORD_HINT;

  public readonly form = this.formBuilder.nonNullable.group({
    username: [
      '',
      [Validators.required, Validators.minLength(3), Validators.maxLength(100)],
    ],
    email: [
      '',
      [Validators.required, Validators.email, Validators.maxLength(255)],
    ],
    password: ['', [Validators.required, ...passwordValidators]],
  });

  public submitting = false;
  public serverError: string | null = null;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  public submit(): void {
    if (this.form.invalid || this.submitting) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.serverError = null;

    this.authService
      .register(this.form.getRawValue())
      .pipe(finalize(() => (this.submitting = false)))
      .subscribe({
        next: () => void this.router.navigate(['/articles']),
        error: (error: HttpErrorResponse) => {
          this.serverError = toErrorMessage(
            error,
            "L'inscription a échoué, veuillez réessayer."
          );
        },
      });
  }
}

