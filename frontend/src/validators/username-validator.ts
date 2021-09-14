import { RuleValidate, Validator } from 'vee-validate';

export const validate: RuleValidate = x => (/^[\w]{3,16}$/.test(x));

Validator.extend('username', {
  getMessage: () => 'Invalid username',
  validate
});
