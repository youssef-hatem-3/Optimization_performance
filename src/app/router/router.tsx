import {
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { AppShell } from "../../components/ui/AppShell";
import { DashboardPage } from "../../features/dashboard/DashboardPage";
import { UsersPage } from "../../features/users/UsersPage";
import { ProductsPage } from "../../features/products/ProductsPage";
import { NotificationsPage } from "../../features/notifications/NotificationsPage";

const rootRoute = createRootRoute({ component: AppShell });
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: DashboardPage,
});

const productsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/products",
  component: ProductsPage,
});
const ordersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/orders",
}).lazy(() => import("./orders.lazy").then((module) => module.Route));
const notificationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/notifications",
  component: NotificationsPage,
});
const usersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/users",
  component: UsersPage,
});
const routeTree = rootRoute.addChildren([
  dashboardRoute,
  usersRoute,
  productsRoute,
  ordersRoute,
  notificationsRoute,
]);
export const router = createRouter({ routeTree });
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
