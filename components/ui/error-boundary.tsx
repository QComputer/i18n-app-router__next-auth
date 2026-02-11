/**
 * Error Boundary Component
 * 
 * Catches JavaScript errors anywhere in the child component tree
 * and displays a fallback UI.
 */

"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "./button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, resetErrorBoundary: () => void) => ReactNode);
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      if (typeof this.props.fallback === "function") {
        return this.props.fallback(this.state.error!, this.handleReset);
      }

      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <DefaultErrorFallback error={this.state.error!} onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}

/**
 * Default error fallback UI
 */
function DefaultErrorFallback({
  error,
  onReset,
}: {
  error: Error;
  onReset: () => void;
}): React.ReactElement {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
      <div className="flex items-center gap-3 mb-4">
        <AlertCircle className="h-8 w-8 text-red-500" />
        <h2 className="text-xl font-semibold text-gray-900">Something went wrong</h2>
      </div>
      
      <div className="max-w-md w-full bg-gray-50 rounded-lg p-4 mb-6">
        <p className="text-sm text-gray-600 font-medium">Error message:</p>
        <p className="text-red-600 mt-1">{error.message || "An unexpected error occurred"}</p>
        
        {process.env.NODE_ENV === "development" && error.stack && (
          <details className="mt-4 text-left">
            <summary className="text-sm text-gray-500 cursor-pointer">Stack trace</summary>
            <pre className="mt-2 text-xs text-gray-600 overflow-auto max-h-40 p-2 bg-white rounded border">
              {error.stack}
            </pre>
          </details>
        )}
      </div>

      <div className="flex gap-3">
        <Button onClick={onReset} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try again
        </Button>
        <Button onClick={() => window.location.reload()}>
          Reload page
        </Button>
      </div>
    </div>
  );
}

/**
 * Async error boundary hook for data fetching
 */
export function useAsyncError() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const throwError = React.useCallback((err: Error) => {
    setError(err);
  }, []);

  if (error) {
    throw error;
  }

  return { error, resetError, throwError };
}
