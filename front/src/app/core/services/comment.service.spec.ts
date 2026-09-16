import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { Comment } from '../models';
import { CommentService } from './comment.service';

describe('CommentService', () => {
  let service: CommentService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/articles`;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(CommentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('devrait être créé', () => expect(service).toBeTruthy());

  it('getByArticle: devrait appeler GET /articles/{id}/comments', () => {
    const mockComments: Comment[] = [];
    service.getByArticle(7).subscribe((comments) => expect(comments).toEqual(mockComments));

    const req = httpMock.expectOne(`${baseUrl}/7/comments`);
    expect(req.request.method).toBe('GET');
    req.flush(mockComments);
  });

  it("create: devrait poster le commentaire sur l'article", () => {
    const mockComment = { id: 1, content: 'Top article !' } as Comment;

    service
      .create(7, { content: 'Top article !' })
      .subscribe((comment) => expect(comment).toEqual(mockComment));

    const req = httpMock.expectOne(`${baseUrl}/7/comments`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ content: 'Top article !' });
    req.flush(mockComment);
  });

  it('create: devrait propager une erreur de validation (400)', () => {
    service.create(7, { content: '' }).subscribe({
      next: () => fail('ne devrait pas réussir'),
      error: (err) => expect(err.status).toBe(400),
    });

    const req = httpMock.expectOne(`${baseUrl}/7/comments`);
    req.flush({ title: 'Bad Request' }, { status: 400, statusText: 'Bad Request' });
  });
});
