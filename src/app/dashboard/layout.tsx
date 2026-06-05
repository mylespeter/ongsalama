// app/dashboard/layout.tsx
'use client';

import Navigation from '@/components/Navigation';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader } from '@/components/ui/Loader';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return <Loader fullScreen text="Chargement..." />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-backgroun">
      <Navigation />
      <main className="max-w-7xl mx-auto px-4  py-6">
        {children}
      </main>
    </div>
  );
}