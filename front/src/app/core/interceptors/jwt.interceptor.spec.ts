import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';
import { JwtInterceptor } from './jwt.interceptor';

describe('JwtInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getToken', 'logout']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
  });

  afterEach(() => httpMock.verify());

  it('devrait ajouter le header Authorization sur un appel API protégé si un token existe', () => {
    authServiceSpy.getToken.and.returnValue('my-token');

    httpClient.get(`${environment.apiUrl}/articles`).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/articles`);
    expect(req.request.headers.get('Authorization')).toBe('Bearer my-token');
    req.flush({});
  });

  it("ne devrait pas ajouter le header sur /auth/login même si un token existe", () => {
    authServiceSpy.getToken.and.returnValue('my-token');

    httpClient.post(`${environment.apiUrl}/auth/login`, {}).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });

  it('ne devrait pas ajouter le header sur une requête hors API', () => {
    authServiceSpy.getToken.and.returnValue('my-token');

    httpClient.get('https://autre-domaine.test/ping').subscribe();

    const req = httpMock.expectOne('https://autre-domaine.test/ping');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });

  it("ne devrait pas ajouter le header si aucun token n'est stocké", () => {
    authServiceSpy.getToken.and.returnValue(null);

    httpClient.get(`${environment.apiUrl}/articles`).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/articles`);
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });

  it('devrait déconnecter et rediriger vers /login sur une 401 hors routes publiques', () => {
    authServiceSpy.getToken.and.returnValue('expired-token');

    httpClient.get(`${environment.apiUrl}/user/me`).subscribe({
      error: () => {
        expect(authServiceSpy.logout).toHaveBeenCalled();
        expect(router.navigate).toHaveBeenCalledWith(['/login']);
      },
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/user/me`);
    req.flush({ title: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
  });

  it("ne devrait pas déconnecter sur une 401 renvoyée par /auth/login (identifiants invalides)", () => {
    authServiceSpy.getToken.and.returnValue(null);

    httpClient.post(`${environment.apiUrl}/auth/login`, {}).subscribe({
      error: () => {
        expect(authServiceSpy.logout).not.toHaveBeenCalled();
        expect(router.navigate).not.toHaveBeenCalled();
      },
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    req.flush({ title: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });
  });
});
