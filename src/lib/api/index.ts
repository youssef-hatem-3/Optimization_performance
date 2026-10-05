import { generateNotifications, generateOrders, generateProducts, generateUsers } from '../data/generators'
import type { Notification, Order, Product, User } from '../../types/models'

const users = generateUsers(); const products = generateProducts(); const orders = generateOrders(); const notifications = generateNotifications()
const respond = <T,>(data: T): Promise<T> => new Promise((resolve) => setTimeout(() => resolve(data), 350))

export const getUsers = (): Promise<User[]> => respond(users)
export const getProducts = (): Promise<Product[]> => respond(products)
export const getOrders = (): Promise<Order[]> => respond(orders)
export const getNotifications = (): Promise<Notification[]> => respond(notifications)
