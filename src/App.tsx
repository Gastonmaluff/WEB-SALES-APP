import {
  BrowserRouter,
  HashRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'
import { AdminLayout } from './admin/AdminLayout'
import { AdminCouponsPage } from './admin/pages/AdminCouponsPage'
import { AdminCustomersPage } from './admin/pages/AdminCustomersPage'
import { AdminDashboardPage } from './admin/pages/AdminDashboardPage'
import { AdminOrdersPage } from './admin/pages/AdminOrdersPage'
import { AdminProductsPage } from './admin/pages/AdminProductsPage'
import { AdminStockPage } from './admin/pages/AdminStockPage'
import { AppLayout } from './components/layout/AppLayout'
import { AuthProvider } from './context/AuthContext'
import { AccountPage } from './pages/AccountPage'
import { CartPage } from './pages/CartPage'
import { CatalogPage } from './pages/CatalogPage'
import { CategoriesPage } from './pages/CategoriesPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { OrdersPage } from './pages/OrdersPage'
import { ProductPage } from './pages/ProductPage'
import { RegisterPage } from './pages/RegisterPage'
import { AdminRoute } from './routes/AdminRoute'
import { ProtectedRoute } from './routes/ProtectedRoute'

export default function App() {
  const Router = import.meta.env.BASE_URL !== '/' ? HashRouter : BrowserRouter

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/catalogo" element={<CatalogPage />} />
            <Route path="/categorias" element={<CategoriesPage />} />
            <Route path="/producto/:slug" element={<ProductPage />} />
            <Route path="/carrito" element={<CartPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/registro" element={<RegisterPage />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/mi-cuenta" element={<AccountPage />} />
              <Route path="/mi-pedidos" element={<OrdersPage />} />
            </Route>

            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboardPage />} />
                <Route path="productos" element={<AdminProductsPage />} />
                <Route path="stock" element={<AdminStockPage />} />
                <Route path="pedidos" element={<AdminOrdersPage />} />
                <Route path="clientes" element={<AdminCustomersPage />} />
                <Route path="cupones" element={<AdminCouponsPage />} />
              </Route>
            </Route>

            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}
