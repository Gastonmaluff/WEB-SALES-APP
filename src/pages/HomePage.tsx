import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { MotionPage } from '../components/layout/MotionPage'
import { ScrollBoxSequence } from '../components/home/ScrollBoxSequence'
import { ProductCard } from '../components/product/ProductCard'
import { Button } from '../components/ui/Button'
import { Skeleton } from '../components/ui/Skeleton'
import { listProducts } from '../services/products'
import type { Product } from '../types'

export function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      const allProducts = await listProducts()
      if (!active) {
        return
      }
      setProducts(allProducts.filter((item) => item.featured).slice(0, 6))
      setLoading(false)
    }
    load().catch(() => setLoading(false))
    return () => {
      active = false
    }
  }, [])

  return (
    <MotionPage>
      <section className="relative overflow-hidden rounded-4xl border border-slate-200 bg-white px-6 py-10 md:px-10 md:py-14">
        <div className="absolute -top-20 -right-16 h-60 w-60 rounded-full bg-amber-200/35 blur-2xl" />
        <div className="absolute -bottom-20 -left-10 h-64 w-64 rounded-full bg-slate-900/8 blur-3xl" />
        <div className="relative space-y-6">
          <p className="font-title text-sm tracking-[0.3em] text-slate-500 uppercase">
            E-commerce Premium
          </p>
          <h1 className="font-title max-w-2xl text-4xl leading-tight text-slate-900 md:text-6xl">
            Vendé online con una plataforma moderna y escalable.
          </h1>
          <p className="max-w-2xl text-base text-slate-600 md:text-lg">
            Catálogo avanzado, variantes inteligentes, cupones dinámicos, pedidos,
            stock y panel administrativo completo en una sola experiencia.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/catalogo">
              <Button>
                Explorar catálogo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/admin">
              <Button variant="ghost">Ir al panel admin</Button>
            </Link>
          </div>
        </div>
      </section>

      <ScrollBoxSequence />

      <section className="mt-12 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-title text-2xl text-slate-900 md:text-3xl">
            Destacados
          </h2>
          <Link className="text-sm font-semibold text-slate-700" to="/catalogo">
            Ver todos
          </Link>
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
      </section>
    </MotionPage>
  )
}
