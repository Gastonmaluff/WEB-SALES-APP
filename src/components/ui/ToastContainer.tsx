import { AnimatePresence, motion } from 'framer-motion'
import { CircleAlert, CircleCheck, Info } from 'lucide-react'
import { useEffect } from 'react'
import { useUiStore } from '../../store/uiStore'

const iconMap = {
  success: <CircleCheck className="h-5 w-5 text-emerald-500" />,
  error: <CircleAlert className="h-5 w-5 text-rose-500" />,
  info: <Info className="h-5 w-5 text-sky-500" />,
}

export function ToastContainer() {
  const { toasts, removeToast } = useUiStore()

  useEffect(() => {
    if (!toasts.length) {
      return
    }
    const timers = toasts.map((toast) =>
      window.setTimeout(() => removeToast(toast.id), 3400),
    )
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer))
    }
  }, [removeToast, toasts])

  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-50 flex w-[min(92vw,380px)] flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.article
            key={toast.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="pointer-events-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-lg"
          >
            <div className="flex items-start gap-3">
              {iconMap[toast.tone]}
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-800">{toast.title}</p>
                {toast.description ? (
                  <p className="text-xs text-slate-500">{toast.description}</p>
                ) : null}
              </div>
            </div>
          </motion.article>
        ))}
      </AnimatePresence>
    </div>
  )
}
