import React from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { Box, FileText, Inbox, LogOut, Home, LayoutDashboard } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function AdminLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const onLogout = async () => { await logout(); navigate("/admin/login"); };

  const navItems = [
    { to: "/admin", end: true, label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/productos", label: "Productos", icon: Box },
    { to: "/admin/blog", label: "Blog", icon: FileText },
    { to: "/admin/leads", label: "Leads", icon: Inbox },
  ];

  return (
    <div className="min-h-screen bg-zinc-100 flex flex-col">
      <header className="bg-carbon text-white border-b border-zinc-800 sticky top-0 z-30">
        <div className="px-4 h-16 flex items-center justify-between gap-4">
          <Link to="/admin" className="flex items-center gap-3">
            <img src="/zetor-logo.png" alt="Zetor" className="h-9 w-9 object-contain bg-white rounded-full p-0.5" />
            <div className="leading-tight">
              <p className="font-display font-black uppercase tracking-tight text-sm">Admin Zetor</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">Panel administrativo</p>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/" className="hidden sm:inline-flex items-center gap-2 text-sm text-zinc-300 hover:text-white" data-testid="admin-view-site"><Home className="h-4 w-4" /> Ver sitio</Link>
            <span className="hidden md:inline text-xs text-zinc-400">{user?.email}</span>
            <button onClick={onLogout} className="inline-flex items-center gap-2 bg-zetor-red px-3 py-2 text-xs font-bold uppercase tracking-widest rounded-sm hover:bg-[#B91820]" data-testid="admin-logout-btn"><LogOut className="h-3.5 w-3.5" /> Salir</button>
          </div>
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="hidden md:block w-60 bg-white border-r border-zinc-200 p-3">
          <nav className="space-y-1">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) => `flex items-center gap-2 px-3 py-2.5 text-sm font-bold uppercase tracking-wider rounded-sm ${isActive ? "bg-carbon text-white" : "text-zinc-700 hover:bg-zinc-100"}`}
                data-testid={`admin-nav-${label.toLowerCase()}`}
              >
                <Icon className="h-4 w-4" /> {label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="md:hidden mb-4 flex gap-2 overflow-x-auto no-scrollbar">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end} className={({ isActive }) => `whitespace-nowrap inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider rounded-sm border ${isActive ? "bg-carbon text-white border-carbon" : "bg-white text-zinc-700 border-zinc-200"}`}>
                <Icon className="h-3.5 w-3.5" /> {label}
              </NavLink>
            ))}
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
