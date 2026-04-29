import { getMessages } from '@/i18n/get-messages';

export default async function NotFound() {
  const messages = (await getMessages()).messages;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12 text-slate-100">
      <p className="text-sm text-slate-300">{messages.errors.notFound}</p>
    </main>
  );
}
