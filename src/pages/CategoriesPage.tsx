import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { MotionPage } from '../components/layout/MotionPage'
import { Skeleton } from '../components/ui/Skeleton'
import { listProducts } from '../services/products'
import type { Product } from '../types'

export function CategoriesPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      const response = await listProducts()
      if (!active) {
        return
      }
      setProducts(response)
      setLoading(false)
    }
    load().catch(() => setLoading(false))
    return () => {
      active = false
    }
  }, [])

  const categories = useMemo(() => {
    const grouped = new Map<string, number>()
    products.forEach((product) => {
      const current = grouped.get(product.category) ?? 0
      grouped.set(product.category, current + 1)
    })
    return [...grouped.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
  }, [products])

  return (
    <MotionPage>
      <section className="space-y-6">
        <header>
          <h1 className="font-title text-3xl text-slate-900 md:text-4xl">
            Categorías
          </h1>
          <p className="mt-2 text-slate-600">
            Explorá líneas de productos y entrá directo al catálogo filtrado.
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-36 w-full" />
              ))
            : categories.map((category) => (
                <Link
                  key={category.name}
                  to={`/catalogo?categoria=${encodeURIComponent(category.name)}`}
                  className="group rounded-3xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:shadow-md"
                >
                  <p className="text-xs tracking-wide text-slate-500 uppercase">
                    Categoría
                  </p>
                  <p className="mt-2 text-xl font-semibold text-slate-900">
                    {category.name}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {category.count} productos
                  </p>
                </Link>
              ))}
        </div>
      </section>
    </MotionPage>
  )
}
