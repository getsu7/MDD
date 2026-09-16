import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../../core/services';
import { SharedModule } from '../../../shared/shared.module';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let router: Router;
  let queryParams: Record<string, string>;

  beforeEach(async () => {
    queryParams = {};
    authServiceSpy = jasmine.createSpyObj('AuthService', ['login']);

    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [SharedModule, RouterTestingModule, NoopAnimationsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: { get: (key: string) => queryParams[key] ?? null },
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl').and.resolveTo(true);
    fixture.detectChanges();
  });

  it('devrait être créé', () => expect(component).toBeTruthy());

  it('devrait bloquer la soumission tant que le formulaire est invalide', () => {
    component.submit();
    expect(authServiceSpy.login).not.toHaveBeenCalled();
    expect(component.form.controls.identifier.touched).toBeTrue();
  });

  it('devrait appeler AuthService.login puis naviguer vers /articles par défaut', () => {
    authServiceSpy.login.and.returnValue(of({ token: 't', type: 'Bearer' }));
    component.form.setValue({ identifier: 'alice', password: 'Secret123!' });

    component.submit();

    expect(authServiceSpy.login).toHaveBeenCalledWith({
      identifier: 'alice',
      password: 'Secret123!',
    });
    expect(router.navigateByUrl).toHaveBeenCalledWith('/articles');
    expect(component.submitting).toBeFalse();
  });

  it('devrait rediriger vers returnUrl si présent dans les query params', () => {
    queryParams = { returnUrl: '/profile' };
    authServiceSpy.login.and.returnValue(of({ token: 't', type: 'Bearer' }));
    component.form.setValue({ identifier: 'alice', password: 'Secret123!' });

    component.submit();

    expect(router.navigateByUrl).toHaveBeenCalledWith('/profile');
  });

  it("devrait afficher un message d'erreur serveur en cas d'échec de connexion", () => {
    authServiceSpy.login.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 401 }))
    );
    component.form.setValue({ identifier: 'alice', password: 'wrong' });

    component.submit();

    expect(component.serverError).toBe('Identifiant ou mot de passe incorrect.');
    expect(component.submitting).toBeFalse();
  });

  it("devrait afficher le message d'erreur dans le template", () => {
    component.serverError = 'Identifiant ou mot de passe incorrect.';
    fixture.detectChanges();

    const alert = fixture.nativeElement.querySelector('[role="alert"]');
    expect(alert.textContent).toContain('Identifiant ou mot de passe incorrect.');
  });
});
