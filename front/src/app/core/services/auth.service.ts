import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models';
import { TokenStorageService } from './token-storage.service';

/**
 * Authentification : inscription, connexion, déconnexion et état de session.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  private readonly isLoggedIn$ = new BehaviorSubject<boolean>(
    this.tokenStorage.getToken() !== null
  );

  /** État de connexion observable (utilisé par la navbar, les guards, etc.). */
  public readonly isLoggedIn: Observable<boolean> =
    this.isLoggedIn$.asObservable();

  constructor(
    private readonly http: HttpClient,
    private readonly tokenStorage: TokenStorageService
  ) {}

  /** POST /api/auth/register (public) */
  public register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/register`, payload)
      .pipe(tap((response) => this.handleAuthSuccess(response)));
  }

  /** POST /api/auth/login (public) */
  public login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/login`, payload)
      .pipe(tap((response) => this.handleAuthSuccess(response)));
  }

  /** Purge le token et notifie les abonnés. */
  public logout(): void {
    this.tokenStorage.clear();
    this.isLoggedIn$.next(false);
  }

  public getToken(): string | null {
    return this.tokenStorage.getToken();
  }

  /** Lecture synchrone de l'état de connexion (guards, intercepteur). */
  public isAuthenticated(): boolean {
    return this.isLoggedIn$.value;
  }

  private handleAuthSuccess(response: AuthResponse): void {
    this.tokenStorage.saveToken(response.token);
    this.isLoggedIn$.next(true);
  }
}

