import { RuleValidate, Validator } from 'vee-validate';

export const validate: RuleValidate = x => (x.length >= 3 && x.length <= 16 && /^[\w]+$/.test(x));

Validator.extend('username', {
  getMessage: () => 'Invalid username',
  validate
});
