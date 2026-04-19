import type { Product } from '../../types'
import { cn, formatCurrency } from '../../utils/format'

interface VariantSelectorProps {
  product: Product
  selectedOptions: Record<string, string>
  onSelect: (variantId: string, optionId: string) => void
}

export function VariantSelector({
  product,
  selectedOptions,
  onSelect,
}: VariantSelectorProps) {
  return (
    <div className="space-y-4">
      {product.variants.map((variant) => (
        <div key={variant.id} className="space-y-2">
          <p className="text-sm font-semibold text-slate-800">{variant.name}</p>
          <div className="flex flex-wrap gap-2">
            {variant.options.map((option) => {
              const active = selectedOptions[variant.id] === option.id
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onSelect(variant.id, option.id)}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-sm transition',
                    active
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400',
                  )}
                >
                  <span>{option.value}</span>
                  {typeof option.priceModifier === 'number' &&
                  option.priceModifier !== 0 ? (
                    <span className="ml-1 opacity-80">
                      ({option.priceModifier > 0 ? '+' : ''}
                      {formatCurrency(option.priceModifier)})
                    </span>
                  ) : null}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
