import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CartItem, CouponValidationResult } from '../types'

interface CartState {
  items: CartItem[]
  coupon: CouponValidationResult | null
  isCartOpen: boolean
  openCart: () => void
  closeCart: () => void
  addItem: (item: CartItem) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  setCoupon: (coupon: CouponValidationResult | null) => void
  subtotal: () => number
  totalItems: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,
      isCartOpen: false,
      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((cartItem) => cartItem.id === item.id)
          if (!existing) {
            return { items: [...state.items, item], coupon: null }
          }
          return {
            items: state.items.map((cartItem) =>
              cartItem.id === item.id
                ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
                : cartItem,
            ),
            coupon: null,
          }
        }),
      removeItem: (itemId) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
          coupon: null,
        })),
      updateQuantity: (itemId, quantity) =>
        set((state) => ({
          items: state.items
            .map((item) => (item.id === itemId ? { ...item, quantity } : item))
            .filter((item) => item.quantity > 0),
          coupon: null,
        })),
      clearCart: () => set({ items: [], coupon: null }),
      setCoupon: (coupon) => set({ coupon }),
      subtotal: () =>
        get().items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
      totalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: 'web-sales-cart',
      partialize: (state) => ({ items: state.items, coupon: state.coupon }),
    },
  ),
)
