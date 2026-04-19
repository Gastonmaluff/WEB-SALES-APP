import { Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import {
  listProducts,
  removeProduct,
  upsertProduct,
  type UpsertProductPayload,
} from '../../services/products'
import { useUiStore } from '../../store/uiStore'
import type { Product } from '../../types'
import { DEFAULT_CATEGORIES } from '../../utils/constants'
import { formatCurrency } from '../../utils/format'

interface VariantFormOption {
  id: string
  value: string
  image: string
  stock: number
  priceModifier: number
}

interface VariantForm {
  id: string
  name: string
  options: VariantFormOption[]
}

interface ProductForm {
  id?: string
  name: string
  description: string
  category: string
  imagesText: string
  basePrice: number
  featured: boolean
  stock?: number
  variants: VariantForm[]
}

function randomId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`
}

function getInitialForm(): ProductForm {
  return {
    name: '',
    description: '',
    category: DEFAULT_CATEGORIES[0],
    imagesText: '',
    basePrice: 0,
    featured: false,
    stock: undefined,
    variants: [
      {
        id: randomId('var'),
        name: 'Color',
        options: [
          {
            id: randomId('opt'),
            value: 'Rojo',
            image: '',
            stock: 0,
            priceModifier: 0,
          },
        ],
      },
    ],
  }
}

function mapProductToForm(product: Product): ProductForm {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    category: product.category,
    imagesText: product.images.join('\n'),
    basePrice: product.basePrice,
    featured: product.featured,
    stock: product.stock,
    variants: product.variants.map((variant) => ({
      id: variant.id,
      name: variant.name,
      options: variant.options.map((option) => ({
        id: option.id,
        value: option.value,
        image: option.image ?? '',
        stock: option.stock,
        priceModifier: option.priceModifier ?? 0,
      })),
    })),
  }
}

export function AdminProductsPage() {
  const addToast = useUiStore((state) => state.addToast)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<ProductForm>(getInitialForm())

  const refreshProducts = async () => {
    setLoading(true)
    const data = await listProducts({ sort: 'latest' })
    setProducts(data)
    setLoading(false)
  }

  useEffect(() => {
    refreshProducts().catch(() => setLoading(false))
  }, [])

  const submit = async () => {
    if (!form.name.trim() || !form.description.trim()) {
      addToast({
        tone: 'error',
        title: 'Completá nombre y descripción',
      })
      return
    }

    const payload: UpsertProductPayload = {
      id: form.id,
      name: form.name,
      description: form.description,
      category: form.category,
      images: form.imagesText
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
      basePrice: Number(form.basePrice),
      stock: typeof form.stock === 'number' ? form.stock : undefined,
      featured: form.featured,
      variants: form.variants.map((variant) => ({
        id: variant.id,
        name: variant.name,
        options: variant.options.map((option) => ({
          id: option.id,
          value: option.value,
          image: option.image || undefined,
          stock: Number(option.stock),
          priceModifier: Number(option.priceModifier) || 0,
        })),
      })),
    }

    setSaving(true)
    try {
      await upsertProduct(payload)
      setForm(getInitialForm())
      await refreshProducts()
      addToast({
        tone: 'success',
        title: payload.id ? 'Producto actualizado' : 'Producto creado',
      })
    } catch (error) {
      addToast({
        tone: 'error',
        title: 'No se pudo guardar',
        description: error instanceof Error ? error.message : 'Reintentá.',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="space-y-4">
      <h1 className="font-title text-3xl text-slate-900">Productos</h1>

      <article className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-900">
          {form.id ? 'Editar producto' : 'Nuevo producto'}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label="Nombre"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />
          <Select
            label="Categoría"
            value={form.category}
            onChange={(event) => setForm({ ...form, category: event.target.value })}
            options={DEFAULT_CATEGORIES.map((category) => ({
              value: category,
              label: category,
            }))}
          />
          <Input
            label="Precio base"
            type="number"
            value={String(form.basePrice)}
            onChange={(event) =>
              setForm({ ...form, basePrice: Number(event.target.value) || 0 })
            }
          />
          <Input
            label="Stock base (opcional)"
            type="number"
            value={form.stock == null ? '' : String(form.stock)}
            hint="Si usás stock por variantes, podés dejar vacío."
            onChange={(event) =>
              setForm({
                ...form,
                stock:
                  event.target.value.trim() === ''
                    ? undefined
                    : Number(event.target.value),
              })
            }
          />
          <div className="sm:col-span-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-700">Descripción</span>
              <textarea
                className="min-h-24 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none ring-amber-200 transition focus:border-slate-300 focus:ring-4"
                value={form.description}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
                }
              />
            </label>
          </div>
          <div className="sm:col-span-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-slate-700">
                URLs de imágenes (una por línea)
              </span>
              <textarea
                className="min-h-24 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none ring-amber-200 transition focus:border-slate-300 focus:ring-4"
                value={form.imagesText}
                onChange={(event) =>
                  setForm({ ...form, imagesText: event.target.value })
                }
              />
            </label>
          </div>
        </div>

        <label className="inline-flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(event) =>
              setForm({ ...form, featured: event.target.checked })
            }
          />
          Marcar como destacado
        </label>

        <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-slate-900">Variantes</p>
            <Button
              variant="ghost"
              onClick={() =>
                setForm({
                  ...form,
                  variants: [
                    ...form.variants,
                    { id: randomId('var'), name: '', options: [] },
                  ],
                })
              }
            >
              <Plus className="mr-1 h-4 w-4" />
              Agregar variante
            </Button>
          </div>

          {form.variants.map((variant, variantIndex) => (
            <div
              key={variant.id}
              className="space-y-3 rounded-2xl border border-slate-200 bg-white p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <Input
                  label="Nombre variante (ej: Color, Talle)"
                  value={variant.name}
                  onChange={(event) =>
                    setForm((previous) => ({
                      ...previous,
                      variants: previous.variants.map((item, index) =>
                        index === variantIndex
                          ? { ...item, name: event.target.value }
                          : item,
                      ),
                    }))
                  }
                />
                <Button
                  variant="ghost"
                  className="mt-6"
                  onClick={() =>
                    setForm((previous) => ({
                      ...previous,
                      variants: previous.variants.filter(
                        (_, index) => index !== variantIndex,
                      ),
                    }))
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                {variant.options.map((option, optionIndex) => (
                  <div
                    key={option.id}
                    className="grid gap-2 rounded-xl border border-slate-100 p-2 sm:grid-cols-5"
                  >
                    <Input
                      label="Opción"
                      value={option.value}
                      onChange={(event) =>
                        setForm((previous) => ({
                          ...previous,
                          variants: previous.variants.map((item, index) =>
                            index === variantIndex
                              ? {
                                  ...item,
                                  options: item.options.map((current, idx) =>
                                    idx === optionIndex
                                      ? { ...current, value: event.target.value }
                                      : current,
                                  ),
                                }
                              : item,
                          ),
                        }))
                      }
                    />
                    <Input
                      label="Imagen URL"
                      value={option.image}
                      onChange={(event) =>
                        setForm((previous) => ({
                          ...previous,
                          variants: previous.variants.map((item, index) =>
                            index === variantIndex
                              ? {
                                  ...item,
                                  options: item.options.map((current, idx) =>
                                    idx === optionIndex
                                      ? { ...current, image: event.target.value }
                                      : current,
                                  ),
                                }
                              : item,
                          ),
                        }))
                      }
                    />
                    <Input
                      label="Stock"
                      type="number"
                      value={String(option.stock)}
                      onChange={(event) =>
                        setForm((previous) => ({
                          ...previous,
                          variants: previous.variants.map((item, index) =>
                            index === variantIndex
                              ? {
                                  ...item,
                                  options: item.options.map((current, idx) =>
                                    idx === optionIndex
                                      ? {
                                          ...current,
                                          stock: Number(event.target.value) || 0,
                                        }
                                      : current,
                                  ),
                                }
                              : item,
                          ),
                        }))
                      }
                    />
                    <Input
                      label="Precio opcional"
                      type="number"
                      value={String(option.priceModifier)}
                      onChange={(event) =>
                        setForm((previous) => ({
                          ...previous,
                          variants: previous.variants.map((item, index) =>
                            index === variantIndex
                              ? {
                                  ...item,
                                  options: item.options.map((current, idx) =>
                                    idx === optionIndex
                                      ? {
                                          ...current,
                                          priceModifier:
                                            Number(event.target.value) || 0,
                                        }
                                      : current,
                                  ),
                                }
                              : item,
                          ),
                        }))
                      }
                    />
                    <div className="flex items-end">
                      <Button
                        variant="ghost"
                        fullWidth
                        onClick={() =>
                          setForm((previous) => ({
                            ...previous,
                            variants: previous.variants.map((item, index) =>
                              index === variantIndex
                                ? {
                                    ...item,
                                    options: item.options.filter(
                                      (_, idx) => idx !== optionIndex,
                                    ),
                                  }
                                : item,
                            ),
                          }))
                        }
                      >
                        Quitar
                      </Button>
                    </div>
                  </div>
                ))}

                <Button
                  variant="secondary"
                  onClick={() =>
                    setForm((previous) => ({
                      ...previous,
                      variants: previous.variants.map((item, index) =>
                        index === variantIndex
                          ? {
                              ...item,
                              options: [
                                ...item.options,
                                {
                                  id: randomId('opt'),
                                  value: '',
                                  image: '',
                                  stock: 0,
                                  priceModifier: 0,
                                },
                              ],
                            }
                          : item,
                      ),
                    }))
                  }
                >
                  Agregar opción
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={submit} disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar producto'}
          </Button>
          {form.id ? (
            <Button variant="ghost" onClick={() => setForm(getInitialForm())}>
              Cancelar edición
            </Button>
          ) : null}
        </div>
      </article>

      <article className="rounded-3xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-900">Listado</h2>
        <div className="mt-4 space-y-2">
          {loading ? (
            <p className="text-sm text-slate-500">Cargando productos...</p>
          ) : products.length ? (
            products.map((product) => (
              <div
                key={product.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 px-3 py-2"
              >
                <div>
                  <p className="font-medium text-slate-900">{product.name}</p>
                  <p className="text-sm text-slate-500">
                    {product.category} · {formatCurrency(product.basePrice)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => setForm(mapProductToForm(product))}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="danger"
                    onClick={async () => {
                      await removeProduct(product.id)
                      await refreshProducts()
                    }}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">Aún no hay productos.</p>
          )}
        </div>
      </article>
    </section>
  )
}
