import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '../services/auth.service';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated']);

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [AuthGuard, { provide: AuthService, useValue: authServiceSpy }],
    });

    guard = TestBed.inject(AuthGuard);
    router = TestBed.inject(Router);
  });

  it('devrait être créé', () => expect(guard).toBeTruthy());

  it("devrait autoriser l'accès quand l'utilisateur est authentifié", () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);

    const result = guard.canActivate({} as any, { url: '/articles' } as any);

    expect(result).toBeTrue();
  });

  it("devrait rediriger vers /login avec returnUrl quand l'utilisateur n'est pas authentifié", () => {
    authServiceSpy.isAuthenticated.and.returnValue(false);

    const result = guard.canActivate({} as any, { url: '/profile' } as any) as UrlTree;

    expect(result).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(result)).toBe('/login?returnUrl=%2Fprofile');
  });
});
