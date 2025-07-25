'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  className,
  size = 'md'
}: EmptyStateProps) {
  const sizeClasses = {
    sm: {
      container: 'py-8',
      icon: 'h-12 w-12',
      title: 'text-base',
      description: 'text-sm',
    },
    md: {
      container: 'py-12',
      icon: 'h-16 w-16',
      title: 'text-lg',
      description: 'text-base',
    },
    lg: {
      container: 'py-16',
      icon: 'h-20 w-20',
      title: 'text-xl',
      description: 'text-lg',
    },
  };

  const classes = sizeClasses[size];

  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center',
      classes.container,
      className
    )}>
      {icon && (
        <div className={cn(
          'text-legal-300 mb-4',
          classes.icon
        )}>
          {icon}
        </div>
      )}
      
      <h3 className={cn(
        'font-medium text-legal-900 mb-2',
        classes.title
      )}>
        {title}
      </h3>
      
      {description && (
        <p className={cn(
          'text-legal-500 max-w-md mb-6',
          classes.description
        )}>
          {description}
        </p>
      )}
      
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="btn-primary"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
} 