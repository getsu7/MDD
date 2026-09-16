import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { AuthResponse } from '../models';
import { AuthService } from './auth.service';
import { TokenStorageService } from './token-storage.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let tokenStorageSpy: jasmine.SpyObj<TokenStorageService>;

  beforeEach(() => {
    tokenStorageSpy = jasmine.createSpyObj('TokenStorageService', [
      'getToken',
      'saveToken',
      'clear',
    ]);
    tokenStorageSpy.getToken.and.returnValue(null);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: TokenStorageService, useValue: tokenStorageSpy },
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('devrait être créé', () => {
    expect(service).toBeTruthy();
  });

  it("devrait démarrer déconnecté quand aucun token n'est stocké", () => {
    expect(service.isAuthenticated()).toBeFalse();
  });

  it('login: devrait stocker le token et passer isAuthenticated à true', () => {
    const mockResponse: AuthResponse = { token: 'abc.def.ghi', type: 'Bearer' };

    service.login({ identifier: 'alice', password: 'Secret123!' }).subscribe((res) => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);

    expect(tokenStorageSpy.saveToken).toHaveBeenCalledWith('abc.def.ghi');
    expect(service.isAuthenticated()).toBeTrue();
  });

  it('register: devrait stocker le token et passer isAuthenticated à true', () => {
    const mockResponse: AuthResponse = { token: 'jkl.mno.pqr', type: 'Bearer' };

    service
      .register({ username: 'alice', email: 'alice@example.com', password: 'Abcdefg1!' })
      .subscribe((res) => expect(res).toEqual(mockResponse));

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);

    expect(tokenStorageSpy.saveToken).toHaveBeenCalledWith('jkl.mno.pqr');
    expect(service.isAuthenticated()).toBeTrue();
  });

  it('logout: devrait vider le storage et passer isAuthenticated à false', () => {
    service.logout();
    expect(tokenStorageSpy.clear).toHaveBeenCalled();
    expect(service.isAuthenticated()).toBeFalse();
  });

  it('getToken: devrait déléguer à TokenStorageService', () => {
    tokenStorageSpy.getToken.and.returnValue('a-token');
    expect(service.getToken()).toBe('a-token');
  });

  it("login: en cas d'erreur HTTP, ne doit pas modifier l'état de connexion", () => {
    service.login({ identifier: 'x', password: 'y' }).subscribe({
      next: () => fail('ne devrait pas réussir'),
      error: () => {
        expect(service.isAuthenticated()).toBeFalse();
        expect(tokenStorageSpy.saveToken).not.toHaveBeenCalled();
      },
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    req.flush(
      { title: 'Unauthorized' },
      { status: 401, statusText: 'Unauthorized' }
    );
  });
});

describe('AuthService (session déjà active au chargement)', () => {
  it('devrait démarrer connecté si un token est déjà stocké', () => {
    const tokenStorageSpy = jasmine.createSpyObj('TokenStorageService', [
      'getToken',
      'saveToken',
      'clear',
    ]);
    tokenStorageSpy.getToken.and.returnValue('existing-token');

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: TokenStorageService, useValue: tokenStorageSpy },
      ],
    });

    const service = TestBed.inject(AuthService);
    expect(service.isAuthenticated()).toBeTrue();
  });
});
