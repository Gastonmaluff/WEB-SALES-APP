import jsPDF from 'jspdf'
import type { Order } from '../types'
import { formatCurrency, formatDate } from './format'

function renderOrderLines(pdf: jsPDF, order: Order, startY: number) {
  let pointer = startY
  pdf.setFontSize(11)
  order.items.forEach((item) => {
    const variants = Object.entries(item.selectedLabels)
      .map(([name, value]) => `${name}: ${value}`)
      .join(' | ')
    pdf.text(`${item.productName} x${item.quantity}`, 16, pointer)
    pdf.text(formatCurrency(item.lineTotal), 180, pointer, { align: 'right' })
    pointer += 6
    if (variants) {
      pdf.setFontSize(9)
      pdf.text(variants, 18, pointer)
      pdf.setFontSize(11)
      pointer += 5
    }
  })
  return pointer
}

export function generateOrderReceiptPdf(order: Order) {
  const pdf = new jsPDF()
  pdf.setFontSize(18)
  pdf.text('Comprobante de Pedido', 16, 18)

  pdf.setFontSize(11)
  pdf.text(`Pedido: ${order.id}`, 16, 28)
  pdf.text(`Fecha: ${formatDate(order.createdAt)}`, 16, 34)
  pdf.text(`Cliente: ${order.customerName}`, 16, 40)
  pdf.text(`Telefono: ${order.customerPhone}`, 16, 46)
  pdf.text(`Direccion: ${order.address} - ${order.city}`, 16, 52)
  if (order.reference) {
    pdf.text(`Referencia: ${order.reference}`, 16, 58)
  }

  pdf.setDrawColor(220, 220, 220)
  pdf.line(16, 62, 194, 62)

  let cursor = renderOrderLines(pdf, order, 70)
  cursor += 6
  pdf.line(16, cursor, 194, cursor)
  cursor += 8
  pdf.setFontSize(11)
  pdf.text(`Subtotal: ${formatCurrency(order.subtotal)}`, 16, cursor)
  cursor += 6
  pdf.text(`Descuento: -${formatCurrency(order.discount)}`, 16, cursor)
  cursor += 6
  pdf.setFontSize(13)
  pdf.text(`Total: ${formatCurrency(order.total)}`, 16, cursor)

  pdf.save(`pedido-${order.id}.pdf`)
}

export function generatePreparationOrderPdf(order: Order) {
  const pdf = new jsPDF()
  pdf.setFontSize(18)
  pdf.text('Orden de Preparacion', 16, 18)
  pdf.setFontSize(11)
  pdf.text(`Pedido: ${order.id}`, 16, 28)
  pdf.text(`Cliente: ${order.customerName}`, 16, 34)
  pdf.text(`Telefono: ${order.customerPhone}`, 16, 40)

  pdf.setDrawColor(220, 220, 220)
  pdf.line(16, 46, 194, 46)

  renderOrderLines(pdf, order, 54)
  pdf.save(`preparacion-${order.id}.pdf`)
}
