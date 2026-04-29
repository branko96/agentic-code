import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { defaultLocale, isValidLocale, type AppLocale } from '@/i18n/config';
import { getMessages } from '@/i18n/get-messages';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const locale: AppLocale = isValidLocale(params.locale) ? params.locale : defaultLocale;
  const { messages } = await getMessages(locale);

  return {
    title: messages.metadata.title,
    description: messages.metadata.description,
  };
}

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!isValidLocale(params.locale)) {
    notFound();
  }

  return (
    <html lang={params.locale}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
