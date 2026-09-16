import { Location } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-back-button',
  template: `
    <button
      mat-icon-button
      class="back-button"
      type="button"
      aria-label="Retour"
      (click)="goBack()"
    >
      <mat-icon>arrow_back</mat-icon>
    </button>
  `,
  styles: [
    `
      .back-button {
        color: inherit;
      }
    `,
  ],
})
export class BackButtonComponent {
  /** Route de repli lorsqu'aucun historique de navigation n'est disponible. */
  @Input() public fallback = '/';

  constructor(
    private readonly location: Location,
    private readonly router: Router
  ) {}

  public goBack(): void {
    if (window.history.length > 1) {
      this.location.back();
      return;
    }
    void this.router.navigate([this.fallback]);
  }
}

