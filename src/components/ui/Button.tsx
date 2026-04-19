import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'
import { cn } from '../../utils/format'

interface ButtonProps
  extends PropsWithChildren,
    ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  fullWidth?: boolean
}

const styleMap: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950 shadow-sm',
  secondary:
    'bg-amber-100 text-amber-950 hover:bg-amber-200 active:bg-amber-300',
  ghost: 'bg-white text-slate-800 hover:bg-slate-100 active:bg-slate-200',
  danger: 'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800',
}

export function Button({
  children,
  className,
  variant = 'primary',
  fullWidth,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-60',
        styleMap[variant],
        fullWidth ? 'w-full' : '',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
