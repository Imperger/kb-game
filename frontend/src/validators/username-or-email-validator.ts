import { Validator } from 'vee-validate';

import { validate as isUsername, validate } from './username-validator';
import { validate as isEmail } from './email-validator';

Validator.extend('username_or_email', {
  getMessage: () => 'Invalid identifier',
  validate: x => isEmail(x) || isUsername(x)
});
