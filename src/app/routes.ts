import { createBrowserRouter, redirect } from "react-router";
import Layout from "./components/Layout";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import AddProductPage from "./pages/AddProductPage";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/",
    Component: ProtectedRoute,
    children: [
      {
        path: "/",
        Component: Layout,
        children: [
          {
            index: true,
            loader: () => redirect("/products"),
          },
          {
            path: "products",
            Component: ProductsPage,
          },
          {
            path: "products/new",
            Component: AddProductPage,
          },
          {
            path: "products/:id",
            Component: ProductDetailPage,
          },
        ],
      },
    ],
  },
  {
    path: "*",
    loader: () => redirect("/products"),
  },
]);
