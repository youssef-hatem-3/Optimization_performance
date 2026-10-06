import type {
  Notification,
  Order,
  Product,
  Status,
  User,
} from "../../types/models";

const names = [
  "Ava",
  "Liam",
  "Noah",
  "Mia",
  "Ethan",
  "Sophia",
  "Lucas",
  "Emma",
  "Oliver",
  "Isabella",
];
const countries = [
  "Egypt",
  "Canada",
  "Japan",
  "Brazil",
  "Germany",
  "Kenya",
  "Australia",
  "India",
];
const categories = ["Electronics", "Home", "Books", "Fitness", "Office"];
const statuses: Status[] = ["active", "inactive", "pending"];
const orderStatuses: Order["status"][] = [
  "paid",
  "processing",
  "shipped",
  "cancelled",
];

export const generateUsers = (count = 5000): User[] =>
  Array.from({ length: count }, (_, index) => {
    const id = index + 1;
    const name = `${names[index % names.length]} User ${id}`;
    return {
      id,
      name,
      email: `${name.toLowerCase().replace(/ /g, ".")}@lab.dev`,
      age: 18 + (index % 55),
      status: statuses[index % statuses.length],
      country: countries[index % countries.length],
    };
  });

export const generateProducts = (count = 1000): Product[] =>
  Array.from({ length: count }, (_, index) => {
    const id = index + 1;
    return {
      id,
      name: `Product ${id}`,
      category: categories[index % categories.length],
      price: Number((9.99 + ((index * 17) % 900)).toFixed(2)),
      quantity: (index * 13) % 120,
      rating: Number((1 + ((index * 7) % 40) / 10).toFixed(1)),
      imageUrl: `https://dummyjson.com/image/320x240/182238/e7edf8?text=Product+${id}`,
    };
  });

export const generateOrders = (count = 2000): Order[] =>
  Array.from({ length: count }, (_, index) => {
    const id = index + 1;
    return {
      id: `ORD-${String(id).padStart(5, "0")}`,
      customer: `${names[index % names.length]} User ${(index % 5000) + 1}`,
      product: `Product ${(index % 1000) + 1}`,
      price: Number((15 + ((index * 23) % 850)).toFixed(2)),
      status: orderStatuses[index % orderStatuses.length],
      createdAt: new Date(2025, index % 12, (index % 28) + 1).toISOString(),
    };
  });

export const generateNotifications = (count = 1500): Notification[] =>
  Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    title: `Activity update #${index + 1}`,
    message: `A sample notification for performance practice item ${index + 1}.`,
    read: index % 3 === 0,
    createdAt: new Date(Date.now() - index * 3_600_000).toISOString(),
  }));
