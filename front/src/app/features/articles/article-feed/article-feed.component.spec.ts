import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { Article, Page } from '../../../core/models';
import { ArticleService, AuthService } from '../../../core/services';
import { SharedModule } from '../../../shared/shared.module';
import { ArticleFeedComponent } from './article-feed.component';

function page(content: Article[], last = true): Page<Article> {
  return {
    content,
    totalElements: content.length,
    totalPages: 1,
    size: 10,
    number: 0,
    numberOfElements: content.length,
    first: true,
    last,
    empty: content.length === 0,
  };
}

describe('ArticleFeedComponent', () => {
  let component: ArticleFeedComponent;
  let fixture: ComponentFixture<ArticleFeedComponent>;
  let articleServiceSpy: jasmine.SpyObj<ArticleService>;

  beforeEach(async () => {
    articleServiceSpy = jasmine.createSpyObj('ArticleService', ['getFeed']);
    articleServiceSpy.getFeed.and.returnValue(of(page([])));

    await TestBed.configureTestingModule({
      declarations: [ArticleFeedComponent],
      imports: [SharedModule, RouterTestingModule, NoopAnimationsModule],
      providers: [
        { provide: ArticleService, useValue: articleServiceSpy },
        { provide: AuthService, useValue: jasmine.createSpyObj('AuthService', ['logout']) },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ArticleFeedComponent);
    component = fixture.componentInstance;
  });

  it('devrait être créé et charger le fil au démarrage', () => {
    fixture.detectChanges();
    expect(articleServiceSpy.getFeed).toHaveBeenCalledWith({
      page: 0,
      size: 10,
      sort: 'createdAt,desc',
    });
  });

  it('devrait afficher les articles reçus', () => {
    const articles: Article[] = [
      {
        id: 1,
        title: 'Titre',
        content: 'Contenu',
        authorId: 1,
        authorUsername: 'alice',
        topicId: 1,
        topicTitle: 'Angular',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    articleServiceSpy.getFeed.and.returnValue(of(page(articles)));

    fixture.detectChanges();

    expect(component.articles.length).toBe(1);
    const titles = fixture.nativeElement.querySelectorAll('.article-card__title');
    expect(titles.length).toBe(1);
    expect(titles[0].textContent).toContain('Titre');
  });

  it('devrait inverser le tri et recharger le fil au clic sur "Trier par"', () => {
    fixture.detectChanges();
    articleServiceSpy.getFeed.calls.reset();

    component.toggleSort();

    expect(component.sortDirection).toBe('asc');
    expect(articleServiceSpy.getFeed).toHaveBeenCalledWith({
      page: 0,
      size: 10,
      sort: 'createdAt,asc',
    });
  });

  it('devrait charger la page suivante avec loadMore() sans écraser les articles existants', () => {
    articleServiceSpy.getFeed.and.returnValue(of(page([{ id: 1 } as Article], false)));
    fixture.detectChanges();

    articleServiceSpy.getFeed.and.returnValue(of(page([{ id: 2 } as Article], true)));
    component.loadMore();

    expect(component.articles.map((a) => a.id)).toEqual([1, 2]);
  });

  it('ne devrait pas charger de page supplémentaire si hasMore est faux', () => {
    fixture.detectChanges();
    articleServiceSpy.getFeed.calls.reset();

    component.loadMore();

    expect(articleServiceSpy.getFeed).not.toHaveBeenCalled();
  });

  it("devrait afficher un message d'erreur en cas d'échec de chargement", () => {
    articleServiceSpy.getFeed.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 500 }))
    );

    fixture.detectChanges();

    expect(component.error).toBe('Impossible de charger le fil d’articles.');
  });
});
