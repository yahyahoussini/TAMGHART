import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Shop from "./pages/Shop";
import Product from "./pages/Product";
import TrackOrder from "./pages/TrackOrder";
import Cart from "./pages/Cart";
import { AdminLayout } from "@/components/admin/AdminLayout";
import AdminLogin from "@/pages/admin/AdminLogin";
import Dashboard from "@/pages/admin/Dashboard";
import Products from "@/pages/admin/Products";
import Orders from "@/pages/admin/Orders";
import ProductEdit from "@/pages/admin/ProductEdit";
import Promos from "@/pages/admin/Promos";
import PromoEdit from "@/pages/admin/PromoEdit";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="products/new" element={<ProductEdit />} />
            <Route path="products/:slug/edit" element={<ProductEdit />} />
            <Route path="orders" element={<Orders />} />
            <Route path="promos" element={<Promos />} />
            <Route path="promos/new" element={<PromoEdit />} />
            <Route path="promos/:id/edit" element={<PromoEdit />} />
            <Route path="customers" element={<div className="p-8 text-center">Customers management coming soon...</div>} />
            <Route path="analytics" element={<div className="p-8 text-center">Analytics dashboard coming soon...</div>} />
            <Route path="settings" element={<div className="p-8 text-center">Admin settings coming soon...</div>} />
          </Route>

          {/* Public Routes */}
          <Route path="/*" element={
            <>
              <Header />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/product/:slug" element={<Product />} />
                <Route path="/track-order" element={<TrackOrder />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Footer />
            </>
          } />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;