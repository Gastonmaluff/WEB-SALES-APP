import { BarChart3, Boxes, PackageSearch, TicketPercent, Users } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { MotionPage } from '../components/layout/MotionPage'

const links = [
  { to: '/admin', label: 'Dashboard', icon: BarChart3, end: true },
  { to: '/admin/productos', label: 'Productos', icon: Boxes },
  { to: '/admin/stock', label: 'Stock', icon: PackageSearch },
  { to: '/admin/pedidos', label: 'Pedidos', icon: PackageSearch },
  { to: '/admin/clientes', label: 'Clientes', icon: Users },
  { to: '/admin/cupones', label: 'Cupones', icon: TicketPercent },
]

export function AdminLayout() {
  return (
    <MotionPage>
      <section className="grid gap-4 lg:grid-cols-[240px_1fr]">
        <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-4">
          <p className="font-title mb-4 text-lg text-slate-900">Panel Admin</p>
          <nav className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition ${
                      isActive
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </NavLink>
              )
            })}
          </nav>
        </aside>
        <div className="space-y-4">
          <Outlet />
        </div>
      </section>
    </MotionPage>
  )
}
