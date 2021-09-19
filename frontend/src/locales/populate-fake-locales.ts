import { Locale, Validator } from 'vee-validate';

import { locales } from './available-locales';

interface DictionaryGuts {
    container: { en: Locale }
}

const defaultLocaleDictionary = () => (Validator.dictionary as unknown as DictionaryGuts).container.en;

export const populateFakeLocales = (): void => {
  locales.forEach(x => Validator.localize(x, defaultLocaleDictionary()));
};
