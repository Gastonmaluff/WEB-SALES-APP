import { AnimatePresence, motion } from 'framer-motion'
import { ShoppingBag, UserCircle2 } from 'lucide-react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCartStore } from '../../store/cartStore'
import { Button } from '../ui/Button'

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Catálogo', href: '/catalogo' },
  { label: 'Categorías', href: '/categorias' },
]

export function Header() {
  const navigate = useNavigate()
  const { user, profile, isAdmin, logout } = useAuth()
  const totalItems = useCartStore((state) => state.totalItems())

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 md:px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-slate-900" />
          <div>
            <p className="font-title text-sm tracking-wide text-slate-500 uppercase">
              WEB SALES
            </p>
            <p className="text-base font-semibold text-slate-900">Store</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                `rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className="relative"
            onClick={() => navigate('/carrito')}
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="ml-1.5 hidden sm:inline">Carrito</span>
            <AnimatePresence>
              {totalItems > 0 ? (
                <motion.span
                  key={String(totalItems)}
                  initial={{ scale: 0.3, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.3, opacity: 0 }}
                  className="absolute -top-1 -right-1 rounded-full bg-amber-400 px-1.5 text-[11px] leading-5 font-bold text-slate-900"
                >
                  {totalItems}
                </motion.span>
              ) : null}
            </AnimatePresence>
          </Button>

          {user ? (
            <div className="hidden items-center gap-2 sm:flex">
              <Button variant="ghost" onClick={() => navigate('/mi-cuenta')}>
                <UserCircle2 className="h-4 w-4" />
                <span className="ml-1.5">
                  {profile?.name ? profile.name.split(' ')[0] : 'Mi cuenta'}
                </span>
              </Button>
              {isAdmin ? (
                <Button variant="secondary" onClick={() => navigate('/admin')}>
                  Admin
                </Button>
              ) : null}
              <Button variant="ghost" onClick={logout}>
                Salir
              </Button>
            </div>
          ) : (
            <Button onClick={() => navigate('/login')}>Ingresar</Button>
          )}
        </div>
      </div>
      <nav className="mx-auto flex w-full max-w-6xl gap-1 overflow-x-auto px-4 pb-3 md:hidden md:px-6">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              `rounded-full px-3 py-1.5 text-sm whitespace-nowrap transition ${
                isActive
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}
