import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
} from 'firebase/firestore'
import type { CartItem, Product, ProductVariant, VariantOption } from '../types'
import { slugify } from '../utils/format'
import { collections, db } from './firebase'

export interface ProductFilters {
  category?: string
  search?: string
  sort?: 'latest' | 'price_asc' | 'price_desc' | 'name_asc'
}

export interface UpsertProductPayload {
  id?: string
  name: string
  description: string
  category: string
  images: string[]
  basePrice: number
  stock?: number
  featured: boolean
  variants: ProductVariant[]
}

function mapProduct(
  id: string,
  data: Partial<Product> & Record<string, unknown>,
): Product {
  return {
    id,
    name: String(data.name ?? ''),
    slug: String(data.slug ?? ''),
    description: String(data.description ?? ''),
    category: String(data.category ?? ''),
    images: Array.isArray(data.images) ? (data.images as string[]) : [],
    basePrice: Number(data.basePrice ?? 0),
    stock:
      typeof data.stock === 'number'
        ? data.stock
        : data.stock === null
          ? undefined
          : undefined,
    featured: Boolean(data.featured),
    variants: Array.isArray(data.variants)
      ? (data.variants as ProductVariant[])
      : [],
    createdAt: String(data.createdAt ?? new Date().toISOString()),
    updatedAt: String(data.updatedAt ?? new Date().toISOString()),
  }
}

export async function listProducts(filters: ProductFilters = {}) {
  const productQuery = query(collection(db, collections.products))
  const snapshot = await getDocs(productQuery)

  const products = snapshot.docs.map((document) =>
    mapProduct(document.id, document.data()),
  )

  let output = [...products]

  if (filters.category && filters.category !== 'Todos') {
    output = output.filter((product) => product.category === filters.category)
  }

  if (filters.search?.trim()) {
    const normalized = filters.search.trim().toLowerCase()
    output = output.filter((product) =>
      `${product.name} ${product.description} ${product.category}`
        .toLowerCase()
        .includes(normalized),
    )
  }

  switch (filters.sort) {
    case 'price_asc':
      output.sort((a, b) => a.basePrice - b.basePrice)
      break
    case 'price_desc':
      output.sort((a, b) => b.basePrice - a.basePrice)
      break
    case 'name_asc':
      output.sort((a, b) => a.name.localeCompare(b.name))
      break
    default:
      output.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
  }

  return output
}

export async function getProductById(id: string) {
  const snapshot = await getDoc(doc(db, collections.products, id))
  if (!snapshot.exists()) {
    return null
  }

  return mapProduct(snapshot.id, snapshot.data())
}

export async function getProductBySlug(slug: string) {
  const products = await listProducts()
  return products.find((item) => item.slug === slug) ?? null
}

export async function upsertProduct(payload: UpsertProductPayload) {
  const now = new Date().toISOString()
  const basePayload = {
    name: payload.name.trim(),
    slug: slugify(payload.name),
    description: payload.description.trim(),
    category: payload.category.trim(),
    images: payload.images,
    basePrice: Number(payload.basePrice),
    stock: payload.stock ?? null,
    featured: payload.featured,
    variants: payload.variants,
    updatedAt: now,
  }

  if (payload.id) {
    await updateDoc(doc(db, collections.products, payload.id), basePayload)
    return payload.id
  }

  const reference = await addDoc(collection(db, collections.products), {
    ...basePayload,
    createdAt: now,
  })
  return reference.id
}

export async function removeProduct(productId: string) {
  await deleteDoc(doc(db, collections.products, productId))
}

export async function adjustVariantOptionStock(params: {
  productId: string
  variantId: string
  optionId: string
  nextStock: number
  actorId?: string
}) {
  const { productId, variantId, optionId, nextStock, actorId } = params
  const snapshot = await getDoc(doc(db, collections.products, productId))
  if (!snapshot.exists()) {
    throw new Error('Producto no encontrado.')
  }

  const product = mapProduct(snapshot.id, snapshot.data())
  const variants = product.variants.map((variant) => {
    if (variant.id !== variantId) {
      return variant
    }
    return {
      ...variant,
      options: variant.options.map((option) =>
        option.id === optionId
          ? {
              ...option,
              stock: Math.max(0, nextStock),
            }
          : option,
      ),
    }
  })

  const previousVariant = product.variants.find((variant) => variant.id === variantId)
  const previousOption = previousVariant?.options.find((item) => item.id === optionId)
  if (!previousOption) {
    throw new Error('Variante no encontrada.')
  }

  await updateDoc(doc(db, collections.products, productId), {
    variants,
    updatedAt: new Date().toISOString(),
  })

  const quantityChange = Math.max(0, nextStock) - previousOption.stock
  await addDoc(collection(db, collections.stockMovements), {
    productId: product.id,
    productName: product.name,
    variantName: previousVariant?.name ?? null,
    optionValue: previousOption.value,
    quantityChange,
    reason: 'manual_adjustment',
    actorId: actorId ?? null,
    createdAt: new Date().toISOString(),
  })
}

export function getSelectedVariantOptions(
  product: Product,
  selectedOptions: Record<string, string>,
) {
  const options: VariantOption[] = []
  product.variants.forEach((variant) => {
    const optionId = selectedOptions[variant.id]
    const option = variant.options.find((item) => item.id === optionId)
    if (option) {
      options.push(option)
    }
  })

  return options
}

export function resolveVariantImage(
  product: Product,
  selectedOptions: Record<string, string>,
) {
  const options = getSelectedVariantOptions(product, selectedOptions)
  const optionImage = options.find((option) => option.image)?.image
  return optionImage ?? product.images[0] ?? ''
}

export function resolveUnitPrice(
  product: Product,
  selectedOptions: Record<string, string>,
) {
  const options = getSelectedVariantOptions(product, selectedOptions)
  return options.reduce(
    (accumulator, option) => accumulator + (option.priceModifier ?? 0),
    product.basePrice,
  )
}

export function resolveAvailableStock(
  product: Product,
  selectedOptions: Record<string, string>,
) {
  if (typeof product.stock === 'number') {
    return product.stock
  }

  const options = getSelectedVariantOptions(product, selectedOptions)
  if (!options.length) {
    const allStocks = product.variants.flatMap((variant) =>
      variant.options.map((option) => option.stock),
    )
    return allStocks.length ? Math.max(0, ...allStocks) : 0
  }

  return Math.min(...options.map((option) => option.stock))
}

export function buildCartItemFromProduct(params: {
  product: Product
  selectedOptions: Record<string, string>
  quantity: number
}): CartItem {
  const { product, selectedOptions, quantity } = params
  const selectedLabels: Record<string, string> = {}
  product.variants.forEach((variant) => {
    const selectedId = selectedOptions[variant.id]
    const matched = variant.options.find((option) => option.id === selectedId)
    if (matched) {
      selectedLabels[variant.name] = matched.value
    }
  })

  const optionSignature = Object.entries(selectedOptions)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([variantId, optionId]) => `${variantId}:${optionId}`)
    .join('|')

  return {
    id: `${product.id}-${optionSignature || 'default'}`,
    productId: product.id,
    productName: product.name,
    image: resolveVariantImage(product, selectedOptions),
    category: product.category,
    quantity,
    selectedOptions,
    selectedLabels,
    unitPrice: resolveUnitPrice(product, selectedOptions),
  }
}
