import { Validator } from 'vee-validate';
import isEmail from 'validator/es/lib/isEmail';

Validator.extend('login_or_email', {
    getMessage: () => 'Invalid identifier',
    validate: x => isEmail(x) || x.length >= 3 && x.length <= 16
});