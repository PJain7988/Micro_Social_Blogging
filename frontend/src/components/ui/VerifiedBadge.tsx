import React from 'react';
import { BadgeCheck } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface VerifiedBadgeProps {
  size?: number;
  className?: string;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({ size = 15, className }) => {
  return (
    <span
      className={cn('inline-flex items-center text-accent shrink-0 align-middle', className)}
      title="Verified Account"
    >
      <BadgeCheck size={size} className="fill-accent text-white" />
    </span>
  );
};
