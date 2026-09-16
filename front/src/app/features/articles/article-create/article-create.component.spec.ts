import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { Article, Topic } from '../../../core/models';
import { ArticleService, AuthService, TopicService } from '../../../core/services';
import { SharedModule } from '../../../shared/shared.module';
import { ArticleCreateComponent } from './article-create.component';

describe('ArticleCreateComponent', () => {
  let component: ArticleCreateComponent;
  let fixture: ComponentFixture<ArticleCreateComponent>;
  let articleServiceSpy: jasmine.SpyObj<ArticleService>;
  let topicServiceSpy: jasmine.SpyObj<TopicService>;
  let router: Router;

  const mockTopics: Topic[] = [{ id: 1, title: 'Angular', description: 'Front' }];

  beforeEach(async () => {
    articleServiceSpy = jasmine.createSpyObj('ArticleService', ['create']);
    topicServiceSpy = jasmine.createSpyObj('TopicService', ['getAll']);
    topicServiceSpy.getAll.and.returnValue(of(mockTopics));

    await TestBed.configureTestingModule({
      declarations: [ArticleCreateComponent],
      imports: [SharedModule, RouterTestingModule, NoopAnimationsModule],
      providers: [
        { provide: ArticleService, useValue: articleServiceSpy },
        { provide: TopicService, useValue: topicServiceSpy },
        { provide: AuthService, useValue: jasmine.createSpyObj('AuthService', ['logout']) },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ArticleCreateComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
  });

  it('devrait être créé et charger la liste des thèmes', () => {
    fixture.detectChanges();
    expect(topicServiceSpy.getAll).toHaveBeenCalled();
    expect(component.topics).toEqual(mockTopics);
  });

  it('devrait afficher une erreur si les thèmes ne peuvent pas être chargés', () => {
    topicServiceSpy.getAll.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 500 }))
    );
    fixture.detectChanges();
    expect(component.serverError).toBe('Impossible de charger les thèmes.');
  });

  it('devrait bloquer la soumission si le formulaire est invalide', () => {
    fixture.detectChanges();
    component.submit();
    expect(articleServiceSpy.create).not.toHaveBeenCalled();
  });

  it("devrait publier l'article puis naviguer vers son détail", () => {
    fixture.detectChanges();
    const createdArticle = { id: 42 } as Article;
    articleServiceSpy.create.and.returnValue(of(createdArticle));

    component.form.setValue({ topicId: 1, title: 'Titre', content: 'Contenu' });
    component.submit();

    expect(articleServiceSpy.create).toHaveBeenCalledWith({
      topicId: 1,
      title: 'Titre',
      content: 'Contenu',
    });
    expect(router.navigate).toHaveBeenCalledWith(['/articles', 42]);
  });

  it('devrait afficher une erreur serveur si la publication échoue', () => {
    fixture.detectChanges();
    articleServiceSpy.create.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 500 }))
    );

    component.form.setValue({ topicId: 1, title: 'Titre', content: 'Contenu' });
    component.submit();

    expect(component.serverError).toBe("L'article n'a pas pu être publié.");
    expect(component.submitting).toBeFalse();
  });
});
