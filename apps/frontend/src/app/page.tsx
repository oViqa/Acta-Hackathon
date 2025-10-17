import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/layout/Header';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const MapView = dynamic(() => import('@/components/map/MapView'), {
  ssr: false,
  loading: () => <LoadingSpinner />
});

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="relative">
        <Suspense fallback={<LoadingSpinner />}>
          <MapView />
        </Suspense>
      </main>
    </div>
  );
}
