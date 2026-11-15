import { Suspense, lazy } from 'react';
import PublicPortfolio from './pages/PublicPortfolio';

const AdminApp = lazy(() => import('./pages/AdminApp'));

export default function App() {
  const pathname = window.location.pathname.replace(/\/+$/, '') || '/';

  if (pathname === '/admin') {
    return (
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-[#121212] text-sm text-[#F4F2ED]/60">
            Loading console...
          </div>
        }
      >
        <AdminApp />
      </Suspense>
    );
  }

  return <PublicPortfolio />;
}
