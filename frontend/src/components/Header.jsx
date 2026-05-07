import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X, Phone, MapPin, MessageCircle, Search } from "lucide-react";
import { formatWhatsAppDisplay, generalWhatsAppMessage } from "../lib/whatsapp";
import api from "../lib/api";

const navItems = [
  { to: "/", label: "Inicio" },
  { to: "/catalogo", label: "Catálogo" },
  { to: "/asesoria", label: "Asist. Técnica" },
  { to: "/nosotros", label: "Nosotros" },
  { to: "/blog", label: "Blog" },
  { to: "/contacto", label: "Contacto" },
];

const handleWhatsApp = (label) => {
  if (window.gtag) {
    window.gtag('event', 'whatsapp_click', {
      event_category: 'lead',
      event_label: label,
    });
  }
  api.post("/contact", {
    nombre: "WhatsApp",
    telefono: "desconocido",
    mensaje: `Click en WhatsApp desde Header - ${label}`,
    tipo: "whatsapp",
  }).catch(() => {});
};

export default function Header() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const onSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/catalogo?q=${encodeURIComponent(search.trim())}`);
      setSearch("");
      setOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-zetor-red text-white text-xs sm:text-[13px]" data-testid="top-announcement-bar">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 py-2 flex items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2 font-medium min-w-0">
            <span className="hidden sm:inline-flex h-1.5 w-1.5 rounded-full bg-white animate-pulse shrink-0" />
            <span className="truncate">
              <span className="hidden sm:inline">Importador Oficial Zetor · </span>Envío a todo Colombia
            </span>
          </div>
          <a href="tel:+573202453457" className="flex items-center gap-1.5 font-bold hover:underline whitespace-nowrap shrink-0" data-testid="top-phone-link">
            <Phone className="h-3.5 w-3.5" />
            <span>+57 320 245 3457</span>
          </a>
        </div>
      </div>

      <div className="bg-carbon text-white border-b border-zinc-800">
        <div className="mx-auto max-w-7xl px-4 h-16 sm:h-20 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 shrink-0" data-testid="logo-link">
            <img src="/zetor-logo.png" alt="Zetor" className="h-11 w-11 sm:h-12 sm:w-12 object-contain bg-white rounded-full p-0.5" />
            <div className="leading-tight">
              <div className="font-display font-black tracking-tight text-sm sm:text-base uppercase whitespace-nowrap">Almacén Zetor Repuestos</div>
              <div className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-zetor-red font-bold">Importador Oficial · Colombia</div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1" data-testid="desktop-nav">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.to === "/"} className={({ isActive }) => `px-3 py-2 text-[13px] font-semibold uppercase tracking-wider transition-colors border-b-2 ${isActive ? "text-white border-zetor-red" : "text-zinc-300 border-transparent hover:text-white hover:border-zinc-600"}`} data-testid={`nav-${item.label.toLowerCase().replace(/\s|\./g, "-")}`}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <form onSubmit={onSearch} className="hidden md:flex items-center bg-zinc-900 border border-zinc-700 px-3 py-1.5 rounded-sm">
              <Search className="h-4 w-4 text-zinc-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} type="text" placeholder="Buscar SKU o repuesto..." className="bg-transparent outline-none text-sm text-white placeholder:text-zinc-500 w-44 ml-2" data-testid="header-search-input" />
            </form>
            <a href={generalWhatsAppMessage()} target="_blank" rel="noopener noreferrer" onClick={() => handleWhatsApp('header_desktop')} className="hidden sm:inline-flex items-center gap-2 bg-whatsapp text-white px-3.5 py-2 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-sm hover:bg-[#1EBE5A] transition" data-testid="header-whatsapp-cta">
              <MessageCircle className="h-4 w-4" />
              Cotizar
            </a>
            <button className="lg:hidden p-2 rounded-sm hover:bg-zinc-800" onClick={() => setOpen(!open)} aria-label="Toggle menu" data-testid="mobile-menu-toggle">
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="lg:hidden border-t border-zinc-800 bg-carbon" data-testid="mobile-menu">
            <form onSubmit={onSearch} className="md:hidden flex items-center mx-4 mt-4 bg-zinc-900 border border-zinc-700 px-3 py-2 rounded-sm">
              <Search className="h-4 w-4 text-zinc-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} type="text" placeholder="Buscar..." className="bg-transparent outline-none text-sm text-white placeholder:text-zinc-500 w-full ml-2" data-testid="mobile-search-input" />
            </form>
            <nav className="flex flex-col py-2">
              {navItems.map((item) => (
                <NavLink key={item.to} to={item.to} end={item.to === "/"} onClick={() => setOpen(false)} className={({ isActive }) => `px-5 py-3 text-sm font-semibold uppercase tracking-wider border-l-4 ${isActive ? "border-zetor-red text-white bg-zinc-900" : "border-transparent text-zinc-300"}`} data-testid={`mobile-nav-${item.label.toLowerCase().replace(/\s|\./g, "-")}`}>
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="px-4 pb-4 pt-2 border-t border-zinc-800 flex items-center gap-2 text-xs text-zinc-400">
              <MapPin className="h-3.5 w-3.5" />
              Calle 19B 35-2, Bogotá
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
