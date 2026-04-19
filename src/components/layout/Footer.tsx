import { Link } from 'react-router-dom'
import { WHATSAPP_TEMPLATE_MESSAGE } from '../../utils/constants'

export function Footer() {
  const encodedMessage = encodeURIComponent(WHATSAPP_TEMPLATE_MESSAGE)
  const whatsappUrl = `https://wa.me/?text=${encodedMessage}`

  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-10 md:grid-cols-3 md:px-6">
        <div className="space-y-2">
          <p className="font-title text-lg text-slate-900">WEB SALES</p>
          <p className="max-w-sm text-sm text-slate-500">
            Plataforma e-commerce lista para escalar, agregar pagos, envíos y
            automatizaciones comerciales.
          </p>
        </div>

        <div className="space-y-2 text-sm text-slate-600">
          <p className="font-semibold text-slate-800">Enlaces</p>
          <Link className="block hover:text-slate-900" to="/catalogo">
            Catálogo
          </Link>
          <Link className="block hover:text-slate-900" to="/mi-pedidos">
            Mis pedidos
          </Link>
          <a
            className="block hover:text-slate-900"
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
          >
            Soporte por WhatsApp
          </a>
        </div>

        <div className="space-y-2 text-sm text-slate-600">
          <p className="font-semibold text-slate-800">Próximas Integraciones</p>
          <p>Pasarela de pagos</p>
          <p>Envíos automáticos</p>
          <p>Reportes avanzados</p>
          <p>Notificaciones transaccionales</p>
        </div>
      </div>
    </footer>
  )
}
