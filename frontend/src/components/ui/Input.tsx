import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  className,
  id,
  ...props
}, ref) => {
  const inputId = id || props.name || Math.random().toString(36).substring(2, 9);

  return (
    <div className="w-full space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-mute tracking-wide uppercase">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={cn(
          'w-full rounded-lg border bg-surface px-3.5 py-2 text-sm text-ink placeholder-mute transition-all',
          'focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent',
          error ? 'border-danger focus:border-danger focus:ring-danger' : 'border-line',
          'disabled:bg-paper disabled:text-mute',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-danger font-medium mt-1">{error}</p>}
      {!error && helperText && <p className="text-xs text-mute mt-1">{helperText}</p>}
    </div>
  );
});

Input.displayName = 'Input';
