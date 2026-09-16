import { FormControl } from '@angular/forms';
import { PASSWORD_HINT, PASSWORD_PATTERN, passwordValidators } from './password.validators';

function validate(value: string) {
  const control = new FormControl(value, passwordValidators);
  return control.errors;
}

describe('passwordValidators', () => {
  it("devrait exposer un message d'aide non vide", () => {
    expect(PASSWORD_HINT.length).toBeGreaterThan(0);
  });

  it('devrait rejeter un mot de passe trop court', () => {
    expect(validate('Ab1!')).toEqual(jasmine.objectContaining({ minlength: jasmine.anything() }));
  });

  it('devrait rejeter un mot de passe sans majuscule', () => {
    expect(validate('abcdefg1!')?.['pattern']).toBeTruthy();
  });

  it('devrait rejeter un mot de passe sans minuscule', () => {
    expect(validate('ABCDEFG1!')?.['pattern']).toBeTruthy();
  });

  it('devrait rejeter un mot de passe sans chiffre', () => {
    expect(validate('Abcdefgh!')?.['pattern']).toBeTruthy();
  });

  it('devrait rejeter un mot de passe sans caractère spécial', () => {
    expect(validate('Abcdefg1')?.['pattern']).toBeTruthy();
  });

  it('devrait accepter un mot de passe valide', () => {
    expect(validate('Abcdefg1!')).toBeNull();
  });

  it('PASSWORD_PATTERN: devrait correspondre directement à un mot de passe valide', () => {
    expect(PASSWORD_PATTERN.test('Abcdefg1!')).toBeTrue();
  });
});
