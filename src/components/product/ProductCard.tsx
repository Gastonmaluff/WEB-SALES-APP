import { motion } from 'framer-motion'
import { ShoppingBag } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Product } from '../../types'
import { formatCurrency } from '../../utils/format'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <motion.article
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
    >
      <Link to={`/producto/${product.slug}`} className="block">
        <div className="aspect-square overflow-hidden bg-slate-100">
          {product.images[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">
              Sin imagen
            </div>
          )}
        </div>
        <div className="space-y-2 p-4">
          <p className="text-xs tracking-wide text-slate-500 uppercase">
            {product.category}
          </p>
          <h3 className="line-clamp-2 text-base font-semibold text-slate-900">
            {product.name}
          </h3>
          <div className="flex items-center justify-between">
            <p className="text-base font-bold text-slate-900">
              {formatCurrency(product.basePrice)}
            </p>
            <span className="inline-flex items-center gap-1 text-sm text-slate-600">
              <ShoppingBag className="h-4 w-4" />
              Ver
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  )
}
