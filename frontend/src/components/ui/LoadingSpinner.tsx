import React from 'react';
import { cn } from '../../utils/cn';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className,
}) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-3',
  };

  return (
    <div
      className={cn(
        'rounded-full animate-spin border-line border-t-accent',
        sizes[size],
        className
      )}
      role="status"
      aria-label="Loading"
    />
  );
};

export const PostSkeleton: React.FC = () => {
  return (
    <div className="p-4 border-b border-line bg-surface animate-pulse space-y-3">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-line shrink-0" />
        <div className="space-y-1.5 flex-1">
          <div className="h-4 w-28 bg-line rounded" />
          <div className="h-3 w-16 bg-line rounded" />
        </div>
      </div>
      <div className="space-y-2 pt-1">
        <div className="h-3.5 bg-line rounded w-full" />
        <div className="h-3.5 bg-line rounded w-5/6" />
        <div className="h-3.5 bg-line rounded w-2/3" />
      </div>
      <div className="flex justify-between pt-2 px-4 max-w-sm">
        <div className="h-4 w-8 bg-line rounded" />
        <div className="h-4 w-8 bg-line rounded" />
        <div className="h-4 w-8 bg-line rounded" />
        <div className="h-4 w-8 bg-line rounded" />
      </div>
    </div>
  );
};
