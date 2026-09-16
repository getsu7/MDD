import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { Topic, User } from '../../../core/models';
import { AuthService, TopicService, UserService } from '../../../core/services';
import { SharedModule } from '../../../shared/shared.module';
import { TopicListComponent } from './topic-list.component';

function mockUser(subscribed: Topic[]): User {
  return {
    id: 1,
    email: 'alice@example.com',
    username: 'alice',
    subscribedTopics: subscribed,
    createdAt: '',
    updatedAt: '',
  };
}

describe('TopicListComponent', () => {
  let component: TopicListComponent;
  let fixture: ComponentFixture<TopicListComponent>;
  let topicServiceSpy: jasmine.SpyObj<TopicService>;
  let userServiceSpy: jasmine.SpyObj<UserService>;

  const mockTopics: Topic[] = [
    { id: 1, title: 'Angular', description: 'Front' },
    { id: 2, title: 'Spring', description: 'Back' },
  ];

  beforeEach(async () => {
    topicServiceSpy = jasmine.createSpyObj('TopicService', ['getAll']);
    userServiceSpy = jasmine.createSpyObj('UserService', [
      'getCurrentUser',
      'subscribe',
      'unsubscribe',
    ]);
    topicServiceSpy.getAll.and.returnValue(of(mockTopics));
    userServiceSpy.getCurrentUser.and.returnValue(of(mockUser([])));

    await TestBed.configureTestingModule({
      declarations: [TopicListComponent],
      imports: [SharedModule, RouterTestingModule, NoopAnimationsModule],
      providers: [
        { provide: TopicService, useValue: topicServiceSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: AuthService, useValue: jasmine.createSpyObj('AuthService', ['logout']) },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TopicListComponent);
    component = fixture.componentInstance;
  });

  it('devrait être créé et charger thèmes + abonnements', () => {
    fixture.detectChanges();
    expect(component.topics).toEqual(mockTopics);
    expect(component.isSubscribed(mockTopics[0])).toBeFalse();
  });

  it("devrait marquer un thème comme déjà abonné selon le profil utilisateur", () => {
    userServiceSpy.getCurrentUser.and.returnValue(of(mockUser([mockTopics[0]])));
    fixture.detectChanges();
    expect(component.isSubscribed(mockTopics[0])).toBeTrue();
    expect(component.isSubscribed(mockTopics[1])).toBeFalse();
  });

  it("devrait s'abonner à un thème et mettre à jour son état", () => {
    fixture.detectChanges();
    userServiceSpy.subscribe.and.returnValue(of(void 0));

    component.subscribe(mockTopics[0]);

    expect(userServiceSpy.subscribe).toHaveBeenCalledWith(1);
    expect(component.isSubscribed(mockTopics[0])).toBeTrue();
  });

  it('ne devrait pas relancer un abonnement déjà en cours ou déjà actif', () => {
    fixture.detectChanges();
    userServiceSpy.subscribe.and.returnValue(of(void 0));
    component.subscribe(mockTopics[0]);
    userServiceSpy.subscribe.calls.reset();

    component.subscribe(mockTopics[0]);

    expect(userServiceSpy.subscribe).not.toHaveBeenCalled();
  });

  it("devrait rester non-abonné si l'abonnement échoue", () => {
    fixture.detectChanges();
    userServiceSpy.subscribe.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 500 }))
    );

    component.subscribe(mockTopics[0]);

    expect(component.isSubscribed(mockTopics[0])).toBeFalse();
    expect(component.isPending(mockTopics[0])).toBeFalse();
  });

  it("devrait afficher un message d'erreur si le chargement échoue", () => {
    topicServiceSpy.getAll.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 500 }))
    );
    fixture.detectChanges();
    expect(component.error).toBe('Impossible de charger les thèmes.');
  });
});
