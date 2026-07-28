import React from 'react';
import { AlertCircle, Inbox } from 'lucide-react';

export function Skeleton({ className = '' }: {className?: string;}) {
  return <div className={`animate-pulse rounded-lg bg-ink/[0.06] ${className}`} />;
}

export function CardSkeletonGrid({ count = 3, className = '' }: {count?: number;className?: string;}) {
  return (
    <div className={`grid gap-8 sm:grid-cols-2 lg:grid-cols-3 ${className}`}>
      {Array.from({ length: count }).map((_, index) =>
      <div key={index} className="overflow-hidden rounded-2xl border border-line bg-card p-0">
          <Skeleton className="aspect-[16/10] w-full rounded-none" />
          <div className="space-y-3 p-6">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      )}
    </div>);

}

export function EmptyState({
  title,
  description,
  icon




}: {title: string;description?: string;icon?: React.ReactNode;}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-card/60 px-8 py-16 text-center">
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-teal/10 text-teal">
        {icon ?? <Inbox className="h-5 w-5" aria-hidden="true" />}
      </span>
      <h3 className="font-heading text-xl text-ink">{title}</h3>
      {description && <p className="mt-2 max-w-md text-sm leading-relaxed text-subtle">{description}</p>}
    </div>);

}

export function ErrorState({ message, onRetry }: {message: string;onRetry?: () => void;}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-3 rounded-2xl border border-line bg-card px-6 py-6 text-left sm:flex-row sm:items-center sm:justify-between">
      
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" aria-hidden="true" />
        <div>
          <p className="font-medium text-ink">We couldn’t load this content.</p>
          <p className="mt-1 text-sm text-subtle">{message}</p>
        </div>
      </div>
      {onRetry &&
      <button
        type="button"
        onClick={onRetry}
        className="shrink-0 rounded-full border border-line px-5 py-2 text-sm font-medium text-ink transition-colors hover:border-teal hover:text-teal">
        
          Try again
        </button>
      }
    </div>);

}