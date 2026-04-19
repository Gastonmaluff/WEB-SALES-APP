import { Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { MotionPage } from '../components/layout/MotionPage'
import { ProductCard } from '../components/product/ProductCard'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Skeleton } from '../components/ui/Skeleton'
import { listProducts } from '../services/products'
import type { Product } from '../types'
import { DEFAULT_CATEGORIES, PRODUCT_SORT_OPTIONS } from '../utils/constants'

export function CatalogPage() {
  const [searchParams] = useSearchParams()
  const categoryFromQuery = searchParams.get('categoria')
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryOptions, setCategoryOptions] = useState<string[]>([
    'Todos',
    ...DEFAULT_CATEGORIES,
  ])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState(categoryFromQuery ?? 'Todos')
  const [sort, setSort] =
    useState<(typeof PRODUCT_SORT_OPTIONS)[number]['value']>('latest')

  useEffect(() => {
    if (categoryFromQuery) {
      setCategory(categoryFromQuery)
    }
  }, [categoryFromQuery])

  useEffect(() => {
    let active = true
    const loadCategories = async () => {
      const allProducts = await listProducts()
      if (!active) {
        return
      }
      const fromProducts = allProducts.map((item) => item.category)
      setCategoryOptions(
        Array.from(new Set(['Todos', ...DEFAULT_CATEGORIES, ...fromProducts])),
      )
    }
    const load = async () => {
      setLoading(true)
      const fetched = await listProducts({ category, search, sort })
      if (!active) {
        return
      }
      setProducts(fetched)
      setLoading(false)
    }
    loadCategories().catch(() => {})
    const timer = window.setTimeout(load, 180)
    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [category, search, sort])

  const categories = useMemo(() => categoryOptions, [categoryOptions])

  return (
    <MotionPage>
      <section className="space-y-6">
        <header>
          <h1 className="font-title text-3xl text-slate-900 md:text-4xl">
            Catálogo
          </h1>
          <p className="mt-2 text-slate-600">
            Buscá, filtrá y encontrá el producto ideal con variantes dinámicas.
          </p>
        </header>

        <div className="grid gap-3 rounded-3xl border border-slate-200 bg-white p-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar productos..."
              label="Buscador"
              className="pl-10"
            />
            <Search className="pointer-events-none relative -top-8 left-3 h-4 w-4 text-slate-400" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1">
            <Select
              label="Categoría"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              options={categories.map((item) => ({ value: item, label: item }))}
            />
            <Select
              label="Orden"
              value={sort}
              onChange={(event) =>
                setSort(event.target.value as (typeof sort))
              }
              options={PRODUCT_SORT_OPTIONS.map((item) => ({
                value: item.value,
                label: item.label,
              }))}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-80 w-full" />
              ))
            : products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
        </div>

        {!loading && !products.length ? (
          <div className="rounded-3xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
            No se encontraron productos para esta búsqueda.
          </div>
        ) : null}
      </section>
    </MotionPage>
  )
}
