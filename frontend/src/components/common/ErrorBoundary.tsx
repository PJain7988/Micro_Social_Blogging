import React from 'react';
import { useRouteError, useNavigate } from 'react-router-dom';
import { AlertOctagon, RotateCcw, Home } from 'lucide-react';
import { Button } from '../ui/Button';

export const RouteErrorBoundary: React.FC = () => {
  const error: any = useRouteError();
  const navigate = useNavigate();

  console.error('Route error caught by ErrorBoundary:', error);

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface rounded-2xl border border-line p-7 shadow-sm text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-red-50 text-danger border border-red-200 flex items-center justify-center mx-auto">
          <AlertOctagon size={28} />
        </div>

        <h1 className="text-xl font-black text-ink">Something went wrong</h1>
        <p className="text-xs text-mute leading-relaxed font-mono bg-paper p-3 rounded-xl border border-line text-left break-words max-h-32 overflow-y-auto">
          {error?.statusText || error?.message || 'An unexpected runtime error occurred'}
        </p>

        <div className="flex items-center justify-center space-x-3 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="flex items-center space-x-1.5"
          >
            <RotateCcw size={14} />
            <span>Reload</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center space-x-1.5"
          >
            <Home size={14} />
            <span>Go Home</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
