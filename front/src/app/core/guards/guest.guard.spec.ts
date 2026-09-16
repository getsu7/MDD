import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '../services/auth.service';
import { GuestGuard } from './guest.guard';

describe('GuestGuard', () => {
  let guard: GuestGuard;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated']);

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [GuestGuard, { provide: AuthService, useValue: authServiceSpy }],
    });

    guard = TestBed.inject(GuestGuard);
    router = TestBed.inject(Router);
  });

  it('devrait être créé', () => expect(guard).toBeTruthy());

  it("devrait autoriser l'accès quand l'utilisateur n'est pas authentifié", () => {
    authServiceSpy.isAuthenticated.and.returnValue(false);
    expect(guard.canActivate()).toBeTrue();
  });

  it("devrait rediriger vers /articles quand l'utilisateur est déjà authentifié", () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);

    const result = guard.canActivate() as UrlTree;

    expect(result).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(result)).toBe('/articles');
  });
});
