import { motion } from 'framer-motion'
import type { PropsWithChildren } from 'react'

export function MotionPage({ children }: PropsWithChildren) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="min-h-[60vh]"
    >
      {children}
    </motion.section>
  )
}
