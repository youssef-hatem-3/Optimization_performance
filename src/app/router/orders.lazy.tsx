import { createLazyRoute } from "@tanstack/react-router";
import { OrdersPage } from "../../features/orders/OrdersPage";

export const Route = createLazyRoute("/orders")({ component: OrdersPage });
