import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs/operators';
import { Topic, UpdateProfileRequest, User } from '../../../core/models';
import { UserService } from '../../../core/services';
import { toErrorMessage } from '../../../shared/utils/api-error';
import {
  PASSWORD_HINT,
  passwordValidators,
} from '../../../shared/utils/password.validators';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
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
    password: ['', passwordValidators],
  });

  public user: User | null = null;
  public loading = true;
  public saving = false;
  public hidePassword = true;
  public error: string | null = null;
  public serverError: string | null = null;

  private pendingTopicIds = new Set<number>();

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly userService: UserService,
    private readonly snackBar: MatSnackBar
  ) {}

  public ngOnInit(): void {
    this.load();
  }

  public get subscriptions(): Topic[] {
    return this.user?.subscribedTopics ?? [];
  }

  public isPending(topic: Topic): boolean {
    return this.pendingTopicIds.has(topic.id);
  }

  public save(): void {
    if (this.form.invalid || this.saving || !this.user) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.buildPayload(this.user);

    if (payload === null) {
      this.snackBar.open('Aucune modification à enregistrer.', 'Fermer', {
        duration: 3000,
      });
      return;
    }

    this.saving = true;
    this.serverError = null;

    this.userService
      .updateProfile(payload)
      .pipe(finalize(() => (this.saving = false)))
      .subscribe({
        next: (user) => {
          this.applyUser(user);
          this.snackBar.open('Profil mis à jour', 'Fermer', { duration: 3000 });
        },
        error: (httpError: HttpErrorResponse) => {
          this.serverError = toErrorMessage(
            httpError,
            'La mise à jour du profil a échoué.'
          );
        },
      });
  }

  public unsubscribe(topic: Topic): void {
    if (this.isPending(topic)) {
      return;
    }

    this.pendingTopicIds.add(topic.id);

    this.userService
      .unsubscribe(topic.id)
      .pipe(finalize(() => this.pendingTopicIds.delete(topic.id)))
      .subscribe({
        next: () => {
          if (this.user) {
            this.user = {
              ...this.user,
              subscribedTopics: this.user.subscribedTopics.filter(
                (item) => item.id !== topic.id
              ),
            };
          }
          this.snackBar.open(`Désabonné de « ${topic.title} »`, 'Fermer', {
            duration: 3000,
          });
        },
        error: (httpError: HttpErrorResponse) => {
          this.snackBar.open(
            toErrorMessage(httpError, 'Le désabonnement a échoué.'),
            'Fermer',
            { duration: 4000 }
          );
        },
      });
  }

  public trackById(_index: number, topic: Topic): number {
    return topic.id;
  }

  private buildPayload(current: User): UpdateProfileRequest | null {
    const { username, email, password } = this.form.getRawValue();

    const payload: UpdateProfileRequest = {
      username: username !== current.username ? username : null,
      email: email !== current.email ? email : null,
      password: password.length > 0 ? password : null,
    };

    const hasChanges = Object.values(payload).some((value) => value !== null);
    return hasChanges ? payload : null;
  }

  private load(): void {
    this.loading = true;
    this.error = null;

    this.userService
      .getCurrentUser()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (user) => this.applyUser(user),
        error: (httpError: HttpErrorResponse) => {
          this.error = toErrorMessage(
            httpError,
            'Impossible de charger votre profil.'
          );
        },
      });
  }

  private applyUser(user: User): void {
    this.user = user;
    this.form.patchValue({
      username: user.username,
      email: user.email,
      password: '',
    });
    this.form.markAsPristine();
  }
}

