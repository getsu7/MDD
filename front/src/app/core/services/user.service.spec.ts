import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { User } from '../models';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/user`;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('devrait être créé', () => expect(service).toBeTruthy());

  it('getCurrentUser: devrait appeler GET /user/me', () => {
    const mockUser = { id: 1, username: 'alice' } as User;
    service.getCurrentUser().subscribe((user) => expect(user).toEqual(mockUser));

    const req = httpMock.expectOne(`${baseUrl}/me`);
    expect(req.request.method).toBe('GET');
    req.flush(mockUser);
  });

  it('updateProfile: devrait appeler PUT /user/me avec le payload fourni', () => {
    const payload = { username: 'bob', email: null, password: null };
    const mockUser = { id: 1, username: 'bob' } as User;

    service.updateProfile(payload).subscribe((user) => expect(user).toEqual(mockUser));

    const req = httpMock.expectOne(`${baseUrl}/me`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    req.flush(mockUser);
  });

  it('subscribe: devrait appeler POST /user/subscriptions/{id}', () => {
    service.subscribe(3).subscribe();

    const req = httpMock.expectOne(`${baseUrl}/subscriptions/3`);
    expect(req.request.method).toBe('POST');
    req.flush(null);
  });

  it('unsubscribe: devrait appeler DELETE /user/subscriptions/{id}', () => {
    service.unsubscribe(3).subscribe();

    const req = httpMock.expectOne(`${baseUrl}/subscriptions/3`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
