import { HttpErrorResponse } from '@angular/common/http';

/**
 * Réponse d'erreur du backend.
 * `errors` n'est présent que pour les échecs de validation (`@Valid`).
 */
export interface ProblemDetail {
  title?: string;
  detail?: string;
  status?: number;
  errors?: Record<string, string>;
}

/**
 * Traduit une erreur HTTP en message affichable.
 */
export function toErrorMessage(
  error: unknown,
  fallback = 'Une erreur est survenue, veuillez réessayer.'
): string {
  if (!(error instanceof HttpErrorResponse)) {
    return fallback;
  }

  if (error.status === 0) {
    return 'Serveur injoignable. Vérifiez votre connexion.';
  }

  const problem = error.error as ProblemDetail | null;

  if (problem?.errors) {
    const messages = Object.values(problem.errors).filter(Boolean);
    if (messages.length > 0) {
      return messages.join(' ');
    }
  }

  return problem?.detail ?? problem?.title ?? fallback;
}

