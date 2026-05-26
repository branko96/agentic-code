'use client';

import { useState } from 'react';
import Tabs from '@/components/aria/Tabs';
import type { TabId } from '@/components/aria/Tabs';
import Corners from '@/components/aria/Corners';
import BrandMark from '@/components/auth/brand-mark';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

const cardStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.05), rgba(15, 23, 42, 0.6))',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid rgba(34, 211, 238, 0.15)',
  boxShadow: 'inset 0 1px 0 rgba(34, 211, 238, 0.1), 0 8px 32px rgba(0, 0, 0, 0.3)',
};

type Props = {
  onLogin: (data: { email: string; pass: string; remember: boolean }) => Promise<void>;
  onRegister: (data: { first: string; last: string; email: string; pass: string }) => Promise<void>;
  loading: boolean;
  success: boolean;
};

export function AuthCard({ onLogin, onRegister, loading, success }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('login');

  return (
    <div className="relative mx-auto w-full max-w-[420px] p-6">
      <Corners color="#22d3ee">
        <div className="flex flex-col items-center gap-6 rounded-xl p-6" style={cardStyle}>
          <BrandMark />
          <Tabs activeTab={activeTab} onChange={setActiveTab} />
          {activeTab === 'login' ? (
            <LoginForm
              onSubmit={onLogin}
              loading={loading}
              success={success}
              onSwitchToRegister={() => setActiveTab('register')}
            />
          ) : (
            <RegisterForm
              onSubmit={onRegister}
              loading={loading}
              success={success}
              onSwitchToLogin={() => setActiveTab('login')}
            />
          )}
        </div>
      </Corners>
    </div>
  );
}
