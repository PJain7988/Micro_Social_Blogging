import React from 'react';
import { cn } from '../../utils/cn';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'accent' | 'danger' | 'success' | 'warning';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className,
}) => {
  const variants = {
    default: 'bg-paper text-mute border border-line',
    accent: 'bg-accentSoft text-accent font-semibold',
    danger: 'bg-red-50 text-danger border border-red-200',
    success: 'bg-green-50 text-success border border-green-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
};
