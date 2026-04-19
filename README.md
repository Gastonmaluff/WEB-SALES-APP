# WEB SALES APP

Plataforma e-commerce completa con frontend público y panel administrativo privado, construida con React + Vite + Firebase.

## Stack

- Frontend: React + Vite + TypeScript
- Estilos: Tailwind CSS
- Backend: Firebase Auth + Firestore
- Estado: Zustand + Context API (auth)
- Iconos: Lucide
- PDF: jsPDF
- Hosting: Firebase Hosting

## Funcionalidades implementadas

### Tienda pública

- Home premium con productos destacados
- Catálogo con:
  - buscador
  - filtro por categoría
  - ordenamiento
- Categorías
- Producto individual con:
  - variantes dinámicas (sin duplicar productos)
  - imagen por opción
  - stock por opción
  - precio opcional por opción
- Carrito persistente
- Checkout protegido con:
  - validación de cupón en tiempo real
  - cálculo de descuento y total
  - creación de pedido en Firestore
- Login / Registro
- Mi cuenta (edición de perfil)
- Mis pedidos (historial + descarga de PDF)

### Pedidos y PDFs

- Flujo completo de pedido
- Estados de pedido:
  - pendiente
  - confirmado
  - en preparación
  - enviado
  - entregado
  - cancelado
- PDF de comprobante de pedido
- PDF de orden de preparación

### Cupones

- Alta de cupones desde admin
- Configuración:
  - código
  - tipo (porcentaje / monto fijo)
  - valor
  - fecha inicio/fin
  - límite total
  - límite por cliente
  - monto mínimo
  - estado
- Validación en checkout
- Registro de uso
- Desactivación automática por límite total

### Panel administrativo (`/admin`)

- Dashboard:
  - ventas del día
  - ventas del mes
  - pedidos totales
  - top productos
- Productos:
  - crear / editar / eliminar
  - variantes + opciones
  - stock por opción
  - imágenes por URL
- Stock:
  - vista por variante
  - ajuste manual de stock
  - historial de movimientos
- Pedidos:
  - listado global
  - cambio de estado
  - PDF operativo
- Clientes:
  - listado
  - historial resumido
  - edición de datos
- Cupones:
  - creación
  - historial de uso
  - estado activo / agotado / vencido

## Estructura

```txt
src/
  admin/
  components/
  context/
  pages/
  routes/
  services/
  store/
  types/
  utils/
```

## Configuración Firebase

El proyecto ya incluye la configuración de Firebase provista. Si querés moverla a `.env`, creá:

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
```

## Desarrollo local

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run lint
```

## Deploy Firebase Hosting

```bash
npm run build
npx firebase-tools deploy --only hosting
```

## Deploy GitHub Pages

El repo ya incluye workflow en `.github/workflows/deploy-pages.yml`.
Cada push a `main` publica automáticamente en GitHub Pages.

Pasos de una sola vez en GitHub:

1. Ir a `Settings` > `Pages`
2. En `Build and deployment`, elegir `Source: GitHub Actions`

Luego solo hacés push a `main`.

## Seguridad y reglas

- Se incluyen `firestore.rules` y `firebase.json`.
- Rutas admin protegidas en frontend por rol.
- Importante: para endurecer seguridad de stock/cupones en producción, mover el checkout transaccional a Cloud Functions y restringir escrituras cliente en Firestore.

## Bonus preparado

- Integración con WhatsApp (link template en footer)
- Base preparada para notificaciones futuras
- Estructura lista para reportes avanzados
