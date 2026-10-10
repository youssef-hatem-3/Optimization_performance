import axios from "axios";
import type {
  Notification,
  Order,
  Product,
  Status,
  User,
} from "../../types/models";

const api = axios.create({
  baseURL: "https://dummyjson.com",
  timeout: 10_000,
});

type CollectionResponse<T, TKey extends string> = Record<TKey, T[]> & {
  total: number;
  skip: number;
  limit: number;
};

type DummyUser = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  role: "admin" | "moderator" | "user";
  address: { country: string };
};

type DummyProduct = {
  id: number;
  title: string;
  thumbnail: string;
  category: string;
  price: number;
  stock: number;
  rating: number;
};

type DummyCart = {
  id: number;
  userId: number;
  products: Array<{
    id: number;
    title: string;
    price: number;
    quantity: number;
  }>;
};

type DummyPost = { id: number; title: string; body: string; userId: number };

const orderStatuses: Order["status"][] = [
  "paid",
  "processing",
  "shipped",
  "cancelled",
];

function getUserStatus(role: DummyUser["role"]): Status { // here role: DummyUser["role"] means that the value that will return it will be one of role property in DummyUser Type
  if (role === "admin") return "active";
  if (role === "moderator") return "pending";
  return "inactive";
}

export async function getUsers(): Promise<User[]> {
  const response = await api.get<CollectionResponse<DummyUser, "users">>(
    "/users",
    {
      params: {
        limit: 0,
        select: "id,firstName,lastName,email,age,role,address",
      },
    },
  );

  return response.data.users.map((user) => ({
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
    email: user.email,
    age: user.age,
    status: getUserStatus(user.role),
    country: user.address.country,
  }));
}

export type ProductsPage = {
  products: Product[];
  total: number;
};

type ProductsPageRequest = {
  page: number;
  pageSize: number;
  sortBy: "price" | "rating";
  order: "asc" | "desc";
};

export async function getProducts({
  page,
  pageSize,
  sortBy,
  order,
}: ProductsPageRequest): Promise<ProductsPage> {
  const response = await api.get<CollectionResponse<DummyProduct, "products">>(
    "/products",
    {
      params: {
        limit: pageSize,
        skip: page * pageSize,
        sortBy,
        order,
        select: "id,title,thumbnail,category,price,stock,rating",
      },
    },
  );

  return {
    total: response.data.total,
    products: response.data.products.map((product) => ({
      id: product.id,
      name: product.title,
      imageUrl: product.thumbnail,
      category: product.category,
      price: product.price,
      quantity: product.stock,
      rating: product.rating,
    })),
  };
}

export async function getOrders(): Promise<Order[]> {
  const [cartsResponse, usersResponse] = await Promise.all([
    api.get<CollectionResponse<DummyCart, "carts">>("/carts", {
      params: { limit: 0 },
    }),
    api.get<CollectionResponse<DummyUser, "users">>("/users", {
      params: { limit: 0, select: "id,firstName,lastName" },
    }),
  ]);
  const customers = new Map(
    usersResponse.data.users.map((user) => [
      user.id,
      `${user.firstName} ${user.lastName}`,
    ]),
  );

  return cartsResponse.data.carts.flatMap((cart) =>
    cart.products.map((product, index) => ({
      id: `CART-${cart.id}-${product.id}`,
      customer: customers.get(cart.userId) ?? `Customer #${cart.userId}`,
      product: product.title,
      price: product.price * product.quantity,
      status: orderStatuses[(cart.id + index) % orderStatuses.length],
      createdAt: new Date(
        Date.UTC(2025, cart.id % 12, (index % 28) + 1),
      ).toISOString(),
    })),
  );
}

export async function getNotifications(): Promise<Notification[]> {
  const response = await api.get<CollectionResponse<DummyPost, "posts">>(
    "/posts",
    {
      params: { limit: 0, select: "id,title,body,userId" },
    },
  );

  return response.data.posts.slice(0, 20).map((post, index) => ({
    id: post.id,
    title: post.title,
    message: post.body,
    read: index % 3 === 0,
    createdAt: new Date(
      Date.UTC(2025, post.userId % 12, (index % 28) + 1),
    ).toISOString(),
  }));
}
