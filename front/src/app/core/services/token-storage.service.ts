import { Injectable } from '@angular/core';

/**
 * Encapsule l'accès au stockage du JWT.
 *
 * Choix : `localStorage`.
 *  - le backend est stateless (JWT signé HMAC-SHA256, pas de cookie de session) ;
 *  - `sessionStorage` perdrait la session à chaque onglet/refermeture, ce qui dégrade l'UX ;
 *  - un cookie `HttpOnly` serait plus sûr vis-à-vis du XSS, mais impose un changement
 *    backend (dépôt du cookie + protection CSRF) hors périmètre de cette étape.
 * Le stockage est isolé ici pour pouvoir changer de stratégie sans toucher au reste du code.
 */
@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  private static readonly TOKEN_KEY = 'mdd.token';

  public getToken(): string | null {
    try {
      return localStorage.getItem(TokenStorageService.TOKEN_KEY);
    } catch {
      return null;
    }
  }

  public saveToken(token: string): void {
    try {
      localStorage.setItem(TokenStorageService.TOKEN_KEY, token);
    } catch {
      // stockage indisponible (mode privé, quota) : la session reste en mémoire
    }
  }

  public clear(): void {
    try {
      localStorage.removeItem(TokenStorageService.TOKEN_KEY);
    } catch {
      // no-op
    }
  }
}

