import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  updateDoc,
  doc,
} from 'firebase/firestore'
import type { DashboardMetrics, Order, StockMovement, UserProfile } from '../types'
import { collections, db } from './firebase'

function isSameDay(dateA: Date, dateB: Date) {
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  )
}

function isSameMonth(dateA: Date, dateB: Date) {
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth()
  )
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const ordersSnapshot = await getDocs(collection(db, collections.orders))
  const orders = ordersSnapshot.docs.map(
    (item) =>
      ({
        id: item.id,
        ...(item.data() as Omit<Order, 'id'>),
      }) satisfies Order,
  )

  const now = new Date()
  let salesToday = 0
  let salesMonth = 0
  const topProductsMap = new Map<string, number>()

  orders.forEach((order) => {
    if (order.status === 'cancelado') {
      return
    }
    const date = new Date(order.createdAt)
    if (isSameDay(date, now)) {
      salesToday += order.total
    }
    if (isSameMonth(date, now)) {
      salesMonth += order.total
    }
    order.items.forEach((item) => {
      const current = topProductsMap.get(item.productName) ?? 0
      topProductsMap.set(item.productName, current + item.quantity)
    })
  })

  const topProducts = [...topProductsMap.entries()]
    .map(([productName, quantity]) => ({ productName, quantity }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5)

  return {
    salesToday,
    salesMonth,
    totalOrders: orders.length,
    topProducts,
  }
}

export async function listCustomers() {
  const usersSnapshot = await getDocs(collection(db, collections.users))
  const ordersSnapshot = await getDocs(collection(db, collections.orders))
  const users = usersSnapshot.docs.map(
    (item) =>
      ({
        uid: item.id,
        ...(item.data() as Omit<UserProfile, 'uid'>),
      }) satisfies UserProfile,
  )
  const orders = ordersSnapshot.docs.map(
    (item) =>
      ({
        id: item.id,
        ...(item.data() as Omit<Order, 'id'>),
      }) satisfies Order,
  )

  return users.map((user) => {
    const userOrders = orders.filter((order) => order.userId === user.uid)
    const totalSpent = userOrders.reduce((sum, order) => sum + order.total, 0)
    return {
      user,
      totalOrders: userOrders.length,
      totalSpent,
      lastOrderDate:
        userOrders.length > 0 ? userOrders[0].createdAt : user.createdAt,
    }
  })
}

export async function updateCustomerProfile(
  uid: string,
  payload: Partial<Pick<UserProfile, 'name' | 'phone' | 'address' | 'city' | 'reference'>>,
) {
  await updateDoc(doc(db, collections.users, uid), {
    ...payload,
    updatedAt: new Date().toISOString(),
  })
}

export async function listStockMovements(maxItems = 60) {
  const stockQuery = query(
    collection(db, collections.stockMovements),
    orderBy('createdAt', 'desc'),
    limit(maxItems),
  )
  const snapshot = await getDocs(stockQuery)
  return snapshot.docs.map(
    (item) =>
      ({
        id: item.id,
        ...(item.data() as Omit<StockMovement, 'id'>),
      }) satisfies StockMovement,
  )
}
