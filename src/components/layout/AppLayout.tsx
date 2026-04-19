import { AnimatePresence } from 'framer-motion'
import { useLocation, Outlet } from 'react-router-dom'
import { Footer } from './Footer'
import { Header } from './Header'
import { ToastContainer } from '../ui/ToastContainer'

export function AppLayout() {
  const location = useLocation()

  return (
    <div className="relative min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.12),transparent_42%),radial-gradient(circle_at_bottom_right,_rgba(15,23,42,0.08),transparent_35%)]">
      <Header />
      <main className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6 md:py-10">
        <AnimatePresence mode="wait" initial={false}>
          <div key={location.pathname}>
            <Outlet />
          </div>
        </AnimatePresence>
      </main>
      <Footer />
      <ToastContainer />
    </div>
  )
}
