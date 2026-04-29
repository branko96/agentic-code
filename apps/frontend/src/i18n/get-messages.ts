import { getRequestConfig } from 'next-intl/server';
import { defaultLocale, isValidLocale, type AppLocale } from './config';
import en from './messages/en';
import pt from './messages/pt';

export async function getMessages(locale?: string) {
  const resolvedLocale: AppLocale = isValidLocale(locale ?? '')
    ? (locale as AppLocale)
    : defaultLocale;

  return {
    locale: resolvedLocale,
    messages: resolvedLocale === 'pt' ? pt : en,
  };
}

export default getRequestConfig(async ({ locale }) => getMessages(locale));
