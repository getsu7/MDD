import { Validators } from '@angular/forms';

export const PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).+$/;

export const PASSWORD_HINT =
  '8 caractères minimum, dont une minuscule, une majuscule, un chiffre et un caractère spécial.';

export const passwordValidators = [
  Validators.minLength(8),
  Validators.maxLength(100),
  Validators.pattern(PASSWORD_PATTERN),
];

