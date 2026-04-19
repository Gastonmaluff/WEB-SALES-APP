import { create } from 'zustand'

export interface ToastMessage {
  id: string
  tone: 'success' | 'error' | 'info'
  title: string
  description?: string
}

interface UiState {
  toasts: ToastMessage[]
  addToast: (toast: Omit<ToastMessage, 'id'>) => void
  removeToast: (toastId: string) => void
}

export const useUiStore = create<UiState>((set) => ({
  toasts: [],
  addToast: (toast) =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          ...toast,
        },
      ],
    })),
  removeToast: (toastId) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== toastId),
    })),
}))
