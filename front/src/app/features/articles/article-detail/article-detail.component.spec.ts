import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { Article, Comment } from '../../../core/models';
import { ArticleService, AuthService, CommentService } from '../../../core/services';
import { SharedModule } from '../../../shared/shared.module';
import { ArticleDetailComponent } from './article-detail.component';

describe('ArticleDetailComponent', () => {
  let component: ArticleDetailComponent;
  let fixture: ComponentFixture<ArticleDetailComponent>;
  let articleServiceSpy: jasmine.SpyObj<ArticleService>;
  let commentServiceSpy: jasmine.SpyObj<CommentService>;

  const mockArticle: Article = {
    id: 7,
    title: 'Titre',
    content: 'Contenu',
    authorId: 1,
    authorUsername: 'alice',
    topicId: 1,
    topicTitle: 'Angular',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(async () => {
    articleServiceSpy = jasmine.createSpyObj('ArticleService', ['getById']);
    commentServiceSpy = jasmine.createSpyObj('CommentService', ['getByArticle', 'create']);
    articleServiceSpy.getById.and.returnValue(of(mockArticle));
    commentServiceSpy.getByArticle.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      declarations: [ArticleDetailComponent],
      imports: [SharedModule, RouterTestingModule, NoopAnimationsModule],
      providers: [
        { provide: ArticleService, useValue: articleServiceSpy },
        { provide: CommentService, useValue: commentServiceSpy },
        { provide: AuthService, useValue: jasmine.createSpyObj('AuthService', ['logout']) },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id: '7' }) } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ArticleDetailComponent);
    component = fixture.componentInstance;
  });

  it("devrait être créé et charger l'article et ses commentaires", () => {
    fixture.detectChanges();
    expect(articleServiceSpy.getById).toHaveBeenCalledWith(7);
    expect(commentServiceSpy.getByArticle).toHaveBeenCalledWith(7);
    expect(component.article).toEqual(mockArticle);
  });

  it("devrait afficher un message d'erreur si l'article est introuvable", () => {
    articleServiceSpy.getById.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 404 }))
    );
    fixture.detectChanges();
    expect(component.error).toBe('Article introuvable.');
  });

  it('ne devrait pas soumettre un commentaire vide', () => {
    fixture.detectChanges();
    component.submitComment();
    expect(commentServiceSpy.create).not.toHaveBeenCalled();
    expect(component.commentForm.controls.content.touched).toBeTrue();
  });

  it("devrait poster un commentaire valide, l'ajouter à la liste et réinitialiser le formulaire", () => {
    const mockComment: Comment = {
      id: 1,
      content: 'Super article',
      authorId: 2,
      authorUsername: 'bob',
      articleId: 7,
      createdAt: new Date().toISOString(),
    };
    commentServiceSpy.create.and.returnValue(of(mockComment));

    fixture.detectChanges();
    component.commentForm.controls.content.setValue('Super article');
    component.submitComment();

    expect(commentServiceSpy.create).toHaveBeenCalledWith(7, { content: 'Super article' });
    expect(component.comments).toContain(mockComment);
    expect(component.commentForm.controls.content.value).toBe('');
  });
});
