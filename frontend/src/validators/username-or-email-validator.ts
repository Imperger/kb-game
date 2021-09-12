import { Validator } from 'vee-validate';
import isEmail from 'validator/es/lib/isEmail';

import { validate as isUsername, validate } from './username-validator';

Validator.extend('username_or_email', {
  getMessage: () => 'Invalid identifier',
  validate: x => isEmail(x) || isUsername(x)
});
