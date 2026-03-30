import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Menu } from "./pages/Menu";
import { MenuItemDetail } from "./pages/MenuItemDetail";
import { Cart } from "./pages/Cart";
import { Checkout } from "./pages/Checkout";
import { OrderTracking } from "./pages/OrderTracking";
import { Profile } from "./pages/Profile";
import { AdminLayout } from "./components/admin/AdminLayout";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminMenuManagement } from "./pages/admin/AdminMenuManagement";
import { AdminOrderManagement } from "./pages/admin/AdminOrderManagement";
import { NotFound } from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "menu", Component: Menu },
      { path: "menu/:id", Component: MenuItemDetail },
      { path: "cart", Component: Cart },
      { path: "checkout", Component: Checkout },
      { path: "orders", Component: OrderTracking },
      { path: "profile", Component: Profile },
    ],
  },
  {
    path: "/admin",
    Component: AdminLayout,
    children: [
      { index: true, Component: AdminDashboard },
      { path: "menu", Component: AdminMenuManagement },
      { path: "orders", Component: AdminOrderManagement },
    ],
  },
  {
    path: "*",
    Component: NotFound,
  },
]);
