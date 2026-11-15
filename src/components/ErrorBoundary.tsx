import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('UI boundary caught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex min-h-screen flex-col items-center justify-center bg-[#121212] px-6 text-center text-[#F4F2ED]">
            <h1 className="font-display text-2xl font-bold">
              MD Abdul Momin Sarker
            </h1>
            <p className="mt-2 max-w-md text-sm text-[#F4F2ED]/70">
              Something went wrong while rendering this view. Please reload the page.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-6 bg-[#E85D26] px-5 py-2.5 text-xs font-semibold text-[#121212] cursor-pointer"
            >
              Reload Page
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
