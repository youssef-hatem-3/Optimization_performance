export type Status = "active" | "inactive" | "pending";

export interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  status: Status;
  country: string;
}
export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
  rating: number;
}
export interface Order {
  id: string;
  customer: string;
  product: string;
  price: number;
  status: "paid" | "processing" | "shipped" | "cancelled";
  createdAt: string;
}
export interface Notification {
  id: number;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}
