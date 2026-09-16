import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { Topic } from '../models';
import { TopicService } from './topic.service';

describe('TopicService', () => {
  let service: TopicService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(TopicService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('devrait être créé', () => expect(service).toBeTruthy());

  it('getAll: devrait appeler GET /topics et renvoyer la liste', () => {
    const mockTopics: Topic[] = [{ id: 1, title: 'Angular', description: 'Front' }];

    service.getAll().subscribe((topics) => expect(topics).toEqual(mockTopics));

    const req = httpMock.expectOne(`${environment.apiUrl}/topics`);
    expect(req.request.method).toBe('GET');
    req.flush(mockTopics);
  });

  it('getAll: devrait propager une erreur HTTP', () => {
    service.getAll().subscribe({
      next: () => fail('ne devrait pas réussir'),
      error: (err) => expect(err.status).toBe(500),
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/topics`);
    req.flush('Erreur serveur', { status: 500, statusText: 'Internal Server Error' });
  });
});
