import { RuleValidate, Validator } from 'vee-validate';
import isEmail from 'validator/es/lib/isEmail';

import i18n from '@/i18n';

export const validate: RuleValidate = x => isEmail(x);

Validator.extend('email', {
  getMessage: () => i18n.tc('auth.invalidEmail'),
  validate
});
