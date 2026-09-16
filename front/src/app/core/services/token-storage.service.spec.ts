import { TestBed } from '@angular/core/testing';
import { TokenStorageService } from './token-storage.service';

describe('TokenStorageService', () => {
  let service: TokenStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TokenStorageService);
    localStorage.clear();
  });

  afterEach(() => localStorage.clear());

  it('devrait être créé', () => {
    expect(service).toBeTruthy();
  });

  it("devrait renvoyer null quand aucun token n'est stocké", () => {
    expect(service.getToken()).toBeNull();
  });

  it('devrait stocker puis relire le token', () => {
    service.saveToken('my-jwt-token');
    expect(service.getToken()).toBe('my-jwt-token');
    expect(localStorage.getItem('mdd.token')).toBe('my-jwt-token');
  });

  it('devrait supprimer le token via clear()', () => {
    service.saveToken('my-jwt-token');
    service.clear();
    expect(service.getToken()).toBeNull();
  });

  it("getToken: devrait renvoyer null si localStorage lève une exception", () => {
    spyOn(localStorage, 'getItem').and.throwError('unavailable');
    expect(service.getToken()).toBeNull();
  });

  it("saveToken: ne doit pas lever d'exception si localStorage est indisponible", () => {
    spyOn(localStorage, 'setItem').and.throwError('quota exceeded');
    expect(() => service.saveToken('token')).not.toThrow();
  });

  it("clear: ne doit pas lever d'exception si localStorage est indisponible", () => {
    spyOn(localStorage, 'removeItem').and.throwError('unavailable');
    expect(() => service.clear()).not.toThrow();
  });
});
