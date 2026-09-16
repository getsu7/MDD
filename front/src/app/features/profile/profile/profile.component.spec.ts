import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { Topic, User } from '../../../core/models';
import { AuthService, UserService } from '../../../core/services';
import { SharedModule } from '../../../shared/shared.module';
import { ProfileComponent } from './profile.component';

const subscribedTopic: Topic = { id: 1, title: 'Angular', description: 'Front' };

function mockUser(): User {
  return {
    id: 1,
    email: 'alice@example.com',
    username: 'alice',
    subscribedTopics: [subscribedTopic],
    createdAt: '',
    updatedAt: '',
  };
}

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let userServiceSpy: jasmine.SpyObj<UserService>;

  beforeEach(async () => {
    userServiceSpy = jasmine.createSpyObj('UserService', [
      'getCurrentUser',
      'updateProfile',
      'unsubscribe',
    ]);
    userServiceSpy.getCurrentUser.and.returnValue(of(mockUser()));

    await TestBed.configureTestingModule({
      declarations: [ProfileComponent],
      imports: [SharedModule, RouterTestingModule, NoopAnimationsModule],
      providers: [
        { provide: UserService, useValue: userServiceSpy },
        { provide: AuthService, useValue: jasmine.createSpyObj('AuthService', ['logout']) },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
  });

  it('devrait être créé et charger le profil utilisateur', () => {
    fixture.detectChanges();
    expect(component.user).toEqual(mockUser());
    expect(component.form.controls.username.value).toBe('alice');
    expect(component.subscriptions).toEqual([subscribedTopic]);
  });

  it("ne devrait rien envoyer si aucun champ n'a changé", () => {
    fixture.detectChanges();
    component.save();
    expect(userServiceSpy.updateProfile).not.toHaveBeenCalled();
  });

  it('ne devrait envoyer que les champs modifiés (PUT partiel)', () => {
    fixture.detectChanges();
    component.form.controls.username.setValue('alice2');
    userServiceSpy.updateProfile.and.returnValue(of({ ...mockUser(), username: 'alice2' }));

    component.save();

    expect(userServiceSpy.updateProfile).toHaveBeenCalledWith({
      username: 'alice2',
      email: null,
      password: null,
    });
  });

  it('devrait afficher une erreur serveur si la mise à jour échoue', () => {
    fixture.detectChanges();
    component.form.controls.username.setValue('alice2');
    userServiceSpy.updateProfile.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 500 }))
    );

    component.save();

    expect(component.serverError).toBe('La mise à jour du profil a échoué.');
  });

  it("devrait se désabonner d'un thème et le retirer de la liste", () => {
    fixture.detectChanges();
    userServiceSpy.unsubscribe.and.returnValue(of(void 0));

    component.unsubscribe(subscribedTopic);

    expect(userServiceSpy.unsubscribe).toHaveBeenCalledWith(1);
    expect(component.subscriptions).toEqual([]);
  });

  it('devrait afficher une erreur si le chargement du profil échoue', () => {
    userServiceSpy.getCurrentUser.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 500 }))
    );
    fixture.detectChanges();
    expect(component.error).toBe('Impossible de charger votre profil.');
  });
});
