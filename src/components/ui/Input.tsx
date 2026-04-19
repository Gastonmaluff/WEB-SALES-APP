import type { InputHTMLAttributes } from 'react'
import { cn } from '../../utils/format'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
}

export function Input({ label, hint, error, className, ...props }: InputProps) {
  return (
    <label className="flex w-full flex-col gap-1.5">
      {label ? (
        <span className="text-sm font-medium text-slate-700">{label}</span>
      ) : null}
      <input
        className={cn(
          'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none ring-amber-200 transition focus:border-slate-300 focus:ring-4',
          error ? 'border-rose-400 ring-rose-100' : '',
          className,
        )}
        {...props}
      />
      {error ? (
        <span className="text-xs text-rose-600">{error}</span>
      ) : hint ? (
        <span className="text-xs text-slate-500">{hint}</span>
      ) : null}
    </label>
  )
}
