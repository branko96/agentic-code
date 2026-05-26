'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { login, register, persistToken, readToken } from '@/lib/auth';
import { AuthCard } from '@/components/aria/AuthCard';
import Background from '@/components/aria/Background';
import TopBar from '@/components/aria/TopBar';
import StatusTicker from '@/components/aria/StatusTicker';
import Footer from '@/components/aria/Footer';
import { LeftPanel, RightPanel } from '@/components/aria/SidePanels';

export default function AuthPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const token = readToken();
    if (token) {
      router.push('/');
    }
  }, [router]);

  async function onLogin(data: { email: string; pass: string; remember: boolean }) {
    setLoading(true);
    setSuccess(false);
    try {
      const response = await login({ email: data.email, password: data.pass });
      persistToken(response.accessToken);
      setSuccess(true);
      setTimeout(() => router.push('/'), 1500);
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function onRegister(data: { first: string; last: string; email: string; pass: string }) {
    setLoading(true);
    setSuccess(false);
    try {
      const response = await register({
        firstName: data.first,
        lastName: data.last,
        email: data.email,
        password: data.pass,
      });
      persistToken(response.accessToken);
      setSuccess(true);
      setTimeout(() => router.push('/'), 1500);
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Background />
      <TopBar />
      <StatusTicker />
      <main className="flex min-h-screen items-start justify-center pt-14 pb-10 lg:grid lg:grid-cols-[1fr_minmax(420px,460px)_1fr]">
        <LeftPanel loading={false} />
        <AuthCard onLogin={onLogin} onRegister={onRegister} loading={loading} success={success} />
        <RightPanel />
      </main>
      <Footer />
    </>
  );
}
