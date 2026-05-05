import "@/App.css";
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";

import { AuthProvider } from "@/context/AuthContext";
import { SiteSettingsProvider } from "@/context/SiteSettingsContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import ScrollToTop from "@/components/ScrollToTop";
import PublicLayout from "@/components/PublicLayout";

import Home from "@/pages/Home";
import Catalogo from "@/pages/Catalogo";
import ProductoDetalle from "@/pages/ProductoDetalle";
import ModeloLanding from "@/pages/ModeloLanding";
import Asesoria from "@/pages/Asesoria";
import Nosotros from "@/pages/Nosotros";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/BlogPost";
import Contacto from "@/pages/Contacto";

import AdminLogin from "@/pages/admin/AdminLogin";
import AdminLayout from "@/pages/admin/AdminLayout";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminProducts from "@/pages/admin/AdminProducts";
import AdminBlog from "@/pages/admin/AdminBlog";
import AdminLeads from "@/pages/admin/AdminLeads";
import AdminSettings from "@/pages/admin/AdminSettings";

function NotFound() {
  return (
    <div className="min-h-[60vh] grid place-items-center px-4 text-center">
      <div>
        <p className="font-display font-black text-6xl text-zetor-red">404</p>
        <p className="mt-2 font-display font-black uppercase tracking-tight text-2xl">Página no encontrada</p>
        <a href="/" className="mt-4 inline-block text-sm font-bold uppercase tracking-widest underline">Volver al inicio</a>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <div className="App">
      <AuthProvider>
        <SiteSettingsProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* Public site */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/catalogo" element={<Catalogo />} />
              <Route path="/producto/:slug" element={<ProductoDetalle />} />
              <Route path="/modelo/:modelo" element={<ModeloLanding />} />
              <Route path="/asesoria" element={<Asesoria />} />
              <Route path="/nosotros" element={<Nosotros />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/contacto" element={<Contacto />} />
              <Route path="*" element={<NotFound />} />
            </Route>

            {/* Admin */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="productos" element={<AdminProducts />} />
              <Route path="configuracion" element={<AdminSettings />} />
              <Route path="blog" element={<AdminBlog />} />
              <Route path="leads" element={<AdminLeads />} />
            </Route>
          </Routes>
          <Toaster richColors position="top-right" />
        </BrowserRouter>
        </SiteSettingsProvider>
      </AuthProvider>
    </div>
  );
}
