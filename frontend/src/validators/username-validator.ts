import { RuleValidate, Validator } from 'vee-validate';

import i18n from '@/i18n';

export const validate: RuleValidate = x => (/^[\w]{3,16}$/.test(x));

Validator.extend('username', {
  getMessage: () => i18n.tc('auth.invalidUsername'),
  validate
});
