import { Link } from 'react-router-dom'
import { MotionPage } from '../components/layout/MotionPage'
import { Button } from '../components/ui/Button'

export function NotFoundPage() {
  return (
    <MotionPage>
      <section className="mx-auto max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center">
        <h1 className="font-title text-5xl text-slate-900">404</h1>
        <p className="mt-2 text-slate-600">La página que buscás no existe.</p>
        <Link to="/">
          <Button className="mt-5">Volver al inicio</Button>
        </Link>
      </section>
    </MotionPage>
  )
}
