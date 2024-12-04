'use client';

import { useUser } from './contexts/UserContext';
import { useEffect } from 'react';
import { redirect } from 'next/navigation';

export default function RootPage() {
  const { user, loading } = useUser();

  useEffect(() => {
    if (!loading && !user) {
      redirect('/login');
    } else if (!loading && user) {
      redirect('/home');
    }
  }, [user, loading]);

  return (
    <div className="h-screen flex items-center justify-center">
      <p className="text-7xl animate-pulse [text-shadow:_0_0_50px_rgba(255,255,255,0.5)]">💬</p>
    </div>
  );
} 