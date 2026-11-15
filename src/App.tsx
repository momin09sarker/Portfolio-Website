import { Suspense, lazy } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import PublicPortfolio from './pages/PublicPortfolio';

const AdminApp = lazy(() => import('./pages/AdminApp'));

export default function App() {
  const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
  const isAdminRoute =
    pathname === '/admin' ||
    pathname.endsWith('/admin') ||
    window.location.hash === '#/admin';

  if (isAdminRoute) {
    return (
      <ErrorBoundary>
        <Suspense
          fallback={
            <div className="flex min-h-screen items-center justify-center bg-[#121212] text-sm text-[#F4F2ED]/60">
              Loading console...
            </div>
          }
        >
          <AdminApp />
        </Suspense>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <PublicPortfolio />
    </ErrorBoundary>
  );
}
