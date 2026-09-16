import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../../core/services';
import { SharedModule } from '../../../shared/shared.module';
import { RegisterComponent } from './register.component';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['register']);

    await TestBed.configureTestingModule({
      declarations: [RegisterComponent],
      imports: [SharedModule, RouterTestingModule, NoopAnimationsModule],
      providers: [{ provide: AuthService, useValue: authServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    fixture.detectChanges();
  });

  it('devrait être créé', () => expect(component).toBeTruthy());

  it('devrait bloquer la soumission si le formulaire est invalide', () => {
    component.submit();
    expect(authServiceSpy.register).not.toHaveBeenCalled();
    expect(component.form.controls.username.touched).toBeTrue();
  });

  it('devrait rejeter un mot de passe qui ne respecte pas la politique de complexité', () => {
    component.form.controls.password.setValue('faible');
    expect(component.form.controls.password.valid).toBeFalse();
  });

  it('devrait accepter un mot de passe conforme', () => {
    component.form.controls.password.setValue('Abcdefg1!');
    expect(component.form.controls.password.hasError('pattern')).toBeFalse();
  });

  it('devrait appeler AuthService.register puis naviguer vers /articles', () => {
    authServiceSpy.register.and.returnValue(of({ token: 't', type: 'Bearer' }));
    component.form.setValue({
      username: 'alice',
      email: 'alice@example.com',
      password: 'Abcdefg1!',
    });

    component.submit();

    expect(authServiceSpy.register).toHaveBeenCalledWith({
      username: 'alice',
      email: 'alice@example.com',
      password: 'Abcdefg1!',
    });
    expect(router.navigate).toHaveBeenCalledWith(['/articles']);
  });

  it("devrait afficher l'erreur serveur en cas d'e-mail déjà utilisé (409)", () => {
    authServiceSpy.register.and.returnValue(
      throwError(
        () =>
          new HttpErrorResponse({
            status: 409,
            error: { detail: 'Adresse e-mail déjà utilisée.' },
          })
      )
    );
    component.form.setValue({
      username: 'alice',
      email: 'alice@example.com',
      password: 'Abcdefg1!',
    });

    component.submit();

    expect(component.serverError).toBe('Adresse e-mail déjà utilisée.');
    expect(component.submitting).toBeFalse();
  });
});
