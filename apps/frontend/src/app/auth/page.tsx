'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { readToken } from '@/lib/auth';
import BrandMark from '@/components/auth/brand-mark';
import Tabs from '@/components/auth/tabs';
import LoginForm from '@/components/auth/login-form';
import RegisterForm from '@/components/auth/register-form';
import Background from '@/components/aria/Background';
import TopBar from '@/components/aria/TopBar';
import StatusTicker from '@/components/aria/StatusTicker';
import Footer from '@/components/aria/Footer';

export default function AuthPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  useEffect(() => {
    const token = readToken();
    if (token) {
      router.push('/');
    }
  }, [router]);

  function handleAuthSuccess() {
    router.push('/');
  }

  return (
    <>
      <Background />
      <TopBar />
      <StatusTicker />
      <main className="flex min-h-screen items-center justify-center pt-14 pb-10">
        <div className="mx-auto w-full max-w-[420px] p-6">
          <BrandMark />
          <div className="rounded-xl border border-surface-border bg-surface p-6 shadow-lg">
            <Tabs activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="pt-6">
              {activeTab === 'login' ? (
                <LoginForm
                  onAuthSuccess={handleAuthSuccess}
                  onSwitchToRegister={() => setActiveTab('register')}
                />
              ) : (
                <RegisterForm
                  onAuthSuccess={handleAuthSuccess}
                  onSwitchToLogin={() => setActiveTab('login')}
                />
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
