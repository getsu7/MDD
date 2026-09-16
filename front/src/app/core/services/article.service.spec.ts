import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { Article, Page } from '../models';
import { ArticleService } from './article.service';

function emptyPage(): Page<Article> {
  return {
    content: [],
    totalElements: 0,
    totalPages: 0,
    size: 10,
    number: 0,
    numberOfElements: 0,
    first: true,
    last: true,
    empty: true,
  };
}

describe('ArticleService', () => {
  let service: ArticleService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/articles`;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(ArticleService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('devrait être créé', () => expect(service).toBeTruthy());

  it('getFeed: devrait appliquer le tri par défaut createdAt,desc sans page ni size', () => {
    const mockPage = emptyPage();
    service.getFeed().subscribe((page) => expect(page).toEqual(mockPage));

    const req = httpMock.expectOne(
      (r) => r.url === baseUrl && r.params.get('sort') === 'createdAt,desc'
    );
    expect(req.request.params.has('page')).toBeFalse();
    expect(req.request.params.has('size')).toBeFalse();
    req.flush(mockPage);
  });

  it('getFeed: devrait transmettre page, size et sort personnalisés', () => {
    const mockPage = emptyPage();
    service.getFeed({ page: 2, size: 5, sort: 'createdAt,asc' }).subscribe((page) =>
      expect(page).toEqual(mockPage)
    );

    const req = httpMock.expectOne(
      (r) =>
        r.url === baseUrl &&
        r.params.get('page') === '2' &&
        r.params.get('size') === '5' &&
        r.params.get('sort') === 'createdAt,asc'
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockPage);
  });

  it('getById: devrait appeler GET /articles/{id}', () => {
    const mockArticle = { id: 42 } as Article;
    service.getById(42).subscribe((article) => expect(article).toEqual(mockArticle));

    const req = httpMock.expectOne(`${baseUrl}/42`);
    expect(req.request.method).toBe('GET');
    req.flush(mockArticle);
  });

  it("create: devrait poster le payload et renvoyer l'article créé", () => {
    const payload = { title: 'Titre', content: 'Contenu', topicId: 1 };
    const mockArticle = { id: 1, ...payload } as unknown as Article;

    service.create(payload).subscribe((article) => expect(article).toEqual(mockArticle));

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(mockArticle);
  });

  it('create: devrait propager une erreur de validation (400)', () => {
    service.create({ title: '', content: '', topicId: 1 }).subscribe({
      next: () => fail('ne devrait pas réussir'),
      error: (err) => expect(err.status).toBe(400),
    });

    const req = httpMock.expectOne(baseUrl);
    req.flush({ title: 'Bad Request' }, { status: 400, statusText: 'Bad Request' });
  });
});
