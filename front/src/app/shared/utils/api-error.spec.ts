import { HttpErrorResponse } from '@angular/common/http';
import { toErrorMessage } from './api-error';

describe('toErrorMessage', () => {
  it('devrait renvoyer le message de repli pour une erreur non HTTP', () => {
    expect(toErrorMessage(new Error('boom'), 'Repli')).toBe('Repli');
  });

  it('devrait signaler un serveur injoignable pour le statut 0', () => {
    const error = new HttpErrorResponse({ status: 0 });
    expect(toErrorMessage(error)).toBe('Serveur injoignable. Vérifiez votre connexion.');
  });

  it('devrait concaténer les messages de validation par champ', () => {
    const error = new HttpErrorResponse({
      status: 400,
      error: { errors: { email: 'Email invalide.', username: 'Trop court.' } },
    });

    const message = toErrorMessage(error);

    expect(message).toContain('Email invalide.');
    expect(message).toContain('Trop court.');
  });

  it("devrait utiliser detail si présent et sans erreurs de champ", () => {
    const error = new HttpErrorResponse({
      status: 409,
      error: { detail: 'Adresse e-mail déjà utilisée.' },
    });

    expect(toErrorMessage(error)).toBe('Adresse e-mail déjà utilisée.');
  });

  it('devrait utiliser title si detail est absent', () => {
    const error = new HttpErrorResponse({
      status: 404,
      error: { title: 'Article introuvable' },
    });

    expect(toErrorMessage(error)).toBe('Article introuvable');
  });

  it("devrait utiliser le message de repli si le corps ne contient rien d'exploitable", () => {
    const error = new HttpErrorResponse({ status: 500, error: null });
    expect(toErrorMessage(error, 'Erreur générique')).toBe('Erreur générique');
  });
});
