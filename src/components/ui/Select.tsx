import type { SelectHTMLAttributes } from 'react'
import { cn } from '../../utils/format'

interface Option {
  value: string
  label: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: Option[]
}

export function Select({ label, options, className, ...props }: SelectProps) {
  return (
    <label className="flex w-full flex-col gap-1.5">
      {label ? (
        <span className="text-sm font-medium text-slate-700">{label}</span>
      ) : null}
      <select
        className={cn(
          'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none ring-amber-200 transition focus:border-slate-300 focus:ring-4',
          className,
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}
