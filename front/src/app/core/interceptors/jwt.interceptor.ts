import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

/**
 * Ajoute l'en-tête `Authorization: Bearer <token>` sur les appels vers l'API
 * et déconnecte l'utilisateur en cas de 401 (token expiré ou invalide).
 */
@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  private static readonly PUBLIC_PATHS = ['/auth/login', '/auth/register'];

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  public intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const token = this.authService.getToken();
    const authorized =
      token !== null && this.isApiRequest(request) && !this.isPublic(request);

    const handledRequest = authorized
      ? request.clone({
          setHeaders: { Authorization: `Bearer ${token}` },
        })
      : request;

    return next.handle(handledRequest).pipe(
      catchError((error: unknown) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          this.handleUnauthorized(request);
        }
        return throwError(() => error);
      })
    );
  }

  private handleUnauthorized(request: HttpRequest<unknown>): void {
    if (this.isPublic(request)) {
      return;
    }
    this.authService.logout();
    void this.router.navigate(['/login']);
  }

  private isApiRequest(request: HttpRequest<unknown>): boolean {
    return request.url.startsWith(environment.apiUrl);
  }

  private isPublic(request: HttpRequest<unknown>): boolean {
    return JwtInterceptor.PUBLIC_PATHS.some((path) =>
      request.url.includes(path)
    );
  }
}

