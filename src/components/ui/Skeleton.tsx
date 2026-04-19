import { cn } from '../../utils/format'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-2xl bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100',
        className,
      )}
    />
  )
}
