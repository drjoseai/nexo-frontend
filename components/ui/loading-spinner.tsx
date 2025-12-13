/**
 * Loading Spinner Component for NEXO v2.0
 * 
 * Reusable loading indicator with multiple size variants.
 * 
 * @module components/ui/loading-spinner
 */

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Size variants for the spinner
 */
const sizeVariants = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-12 w-12',
} as const;

/**
 * Loading spinner props
 */
export interface LoadingSpinnerProps {
  /** Size variant of the spinner */
  size?: keyof typeof sizeVariants;
  /** Additional CSS classes */
  className?: string;
  /** Optional loading text */
  text?: string;
  /** Show full screen overlay */
  fullScreen?: boolean;
}

/**
 * Loading Spinner Component
 * 
 * Displays an animated loading indicator.
 * Can be used inline or as a full-screen overlay.
 * 
 * @example
 * // Inline usage
 * <LoadingSpinner size="sm" />
 * 
 * @example
 * // With text
 * <LoadingSpinner text="Cargando..." />
 * 
 * @example
 * // Full screen overlay
 * <LoadingSpinner fullScreen text="Procesando..." />
 */
export function LoadingSpinner({
  size = 'md',
  className,
  text,
  fullScreen = false,
}: LoadingSpinnerProps) {
  const spinner = (
    <div
      className={cn(
        'flex items-center justify-center gap-2',
        fullScreen && 'flex-col',
        className
      )}
      role="status"
      aria-label={text || 'Cargando'}
      data-testid="loading-spinner"
    >
      <Loader2
        className={cn(
          'animate-spin text-primary',
          sizeVariants[size]
        )}
        aria-hidden="true"
      />
      {text && (
        <span
          className={cn(
            'text-muted-foreground',
            size === 'sm' && 'text-xs',
            size === 'md' && 'text-sm',
            size === 'lg' && 'text-base',
            size === 'xl' && 'text-lg'
          )}
        >
          {text}
        </span>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
        data-testid="loading-overlay"
      >
        {spinner}
      </div>
    );
  }

  return spinner;
}

/**
 * Button Loading State Component
 * 
 * Compact spinner for use inside buttons
 */
export function ButtonSpinner({ className }: { className?: string }) {
  return (
    <Loader2
      className={cn('h-4 w-4 animate-spin', className)}
      aria-hidden="true"
      data-testid="button-spinner"
    />
  );
}

/**
 * Page Loading Component
 * 
 * Full-page loading state for route transitions
 */
export function PageLoading({ text = 'Cargando...' }: { text?: string }) {
  return (
    <div
      className="flex min-h-[400px] w-full items-center justify-center"
      data-testid="page-loading"
    >
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
}

/**
 * Skeleton Loading for content placeholders
 */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-muted p-4',
        className
      )}
      data-testid="skeleton-card"
    >
      <div className="h-4 w-3/4 rounded bg-muted-foreground/20 mb-2" />
      <div className="h-4 w-1/2 rounded bg-muted-foreground/20" />
    </div>
  );
}

export default LoadingSpinner;

