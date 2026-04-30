import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Clock, MessageCircle } from "lucide-react";
import { formatWhatsAppDisplay, generalWhatsAppMessage } from "../lib/whatsapp";

export default function Footer() {
  return (
    <footer className="bg-carbon text-zinc-300" data-testid="site-footer">
      <div className="section-divider" />
      <div className="mx-auto max-w-7xl px-4 py-14 grid gap-10 md:grid-cols-12">
        <div className="md:col-span-4">
          <Link to="/" className="flex items-center gap-3">
            <img src="/zetor-logo.png" alt="Zetor" className="h-12 w-12 object-contain bg-white rounded-full p-0.5" />
            <div>
              <div className="font-display font-black text-base uppercase text-white tracking-tight">Almacén Zetor Repuestos</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-zetor-red font-bold">Importador oficial · Colombia</div>
            </div>
          </Link>
          <p className="mt-4 text-sm text-zinc-400 leading-relaxed">
            Repuestos originales para tractores Zetor con asesoría técnica real. Validamos compatibilidad antes de despachar — porque sabemos que tu trabajo no puede esperar.
          </p>
          <a
            href={generalWhatsAppMessage()}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 bg-whatsapp text-white px-4 py-2.5 text-sm font-bold uppercase tracking-wider rounded-sm hover:bg-[#1EBE5A]"
            data-testid="footer-whatsapp-cta"
          >
            <MessageCircle className="h-4 w-4" /> Cotizar por WhatsApp
          </a>
        </div>

        <div className="md:col-span-2">
          <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-zetor-red mb-4">Catálogo</h4>
          <ul className="space-y-2 text-sm">
            <li><Link className="hover:text-white" to="/catalogo?sistema=motor">Motor</Link></li>
            <li><Link className="hover:text-white" to="/catalogo?sistema=hidraulico">Hidráulico</Link></li>
            <li><Link className="hover:text-white" to="/catalogo?sistema=transmision">Transmisión</Link></li>
            <li><Link className="hover:text-white" to="/catalogo?sistema=frenos">Frenos</Link></li>
            <li><Link className="hover:text-white" to="/catalogo?sistema=filtros">Filtros</Link></li>
          </ul>
        </div>

        <div className="md:col-span-2">
          <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-zetor-red mb-4">Modelos</h4>
          <ul className="space-y-2 text-sm">
            <li><Link className="hover:text-white" to="/modelo/5211">Zetor 5211</Link></li>
            <li><Link className="hover:text-white" to="/modelo/6211">Zetor 6211</Link></li>
            <li><Link className="hover:text-white" to="/modelo/7211">Zetor 7211</Link></li>
            <li><Link className="hover:text-white" to="/modelo/8011">Zetor 8011</Link></li>
          </ul>
        </div>

        <div className="md:col-span-4">
          <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-zetor-red mb-4">Contacto</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 text-zetor-red shrink-0" />
              <span>Calle 19B 35-2, Bogotá, Colombia</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-zetor-red shrink-0" />
              <a href="tel:+573202453457" className="hover:text-white">{formatWhatsAppDisplay()}</a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-zetor-red shrink-0" />
              <a href="mailto:contacto@almacenzetorrepuestos.com" className="hover:text-white">contacto@almacenzetorrepuestos.com</a>
            </li>
            <li className="flex items-start gap-2">
              <Clock className="h-4 w-4 mt-0.5 text-zetor-red shrink-0" />
              <span>Lun – Vie 8:00–17:30 · Sáb 8:00–13:00</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-zinc-800">
        <div className="mx-auto max-w-7xl px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} Almacén de Repuestos Zetor — www.almacenzetorrepuestos.com</p>
          <p className="uppercase tracking-widest">Marcas y referencias propiedad de sus respectivos titulares.</p>
        </div>
      </div>
    </footer>
  );
}
