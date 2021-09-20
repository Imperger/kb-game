import { RuleValidate, Validator } from 'vee-validate';

import i18n from '@/i18n';

export const validate: RuleValidate = x => x.length >= 8 && x.length <= 100;

Validator.extend('password', {
  getMessage: () => i18n.tc('auth.invalidPassword'),
  validate
});
