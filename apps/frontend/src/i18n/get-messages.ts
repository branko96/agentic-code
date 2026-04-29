import { getRequestConfig } from 'next-intl/server';
import { defaultLocale, isValidLocale } from './config';
import en from './messages/en';
import pt from './messages/pt';

export default getRequestConfig(async ({ locale }) => {
  const resolvedLocale = isValidLocale(locale ?? '') ? locale : defaultLocale;

  return {
    locale: resolvedLocale,
    messages: resolvedLocale === 'pt' ? pt : en,
  };
});
