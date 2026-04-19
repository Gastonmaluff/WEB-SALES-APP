import clsx from 'clsx'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export function cn(...inputs: Array<string | false | null | undefined>) {
  return clsx(inputs)
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('es-PY', {
    style: 'currency',
    currency: 'PYG',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatDate(value: string) {
  return format(new Date(value), "dd 'de' MMM yyyy, HH:mm", { locale: es })
}

export function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}
