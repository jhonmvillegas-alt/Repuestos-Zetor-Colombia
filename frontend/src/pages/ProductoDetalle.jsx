import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MessageCircle, ShieldCheck, Wrench, ChevronRight, Phone } from "lucide-react";
import api from "../lib/api";
import ProductCard from "../components/ProductCard";
import { productWhatsAppMessage, generalWhatsAppMessage, formatWhatsAppDisplay } from "../lib/whatsapp";
import { withSmartCrop } from "../lib/cloudinary";

const SYS_LABELS = { motor: "Motor", hidraulico: "Hidráulico", transmision: "Transmisión", frenos: "Frenos", filtros: "Filtros" };

export default function ProductoDetalle() {
  const { slug } = useParams();
  const [p, setP] = useState(null);
  const [related, setRelated] = useState([]);
  const [activeImg, setActiveImg] = useState(null);
  const [modelo, setModelo] = useState("");
  const [ciudad, setCiudad] = useState("");

  useEffect(() => {
    setP(null);
    api.get(`/products/${slug}`).then((r) => {
      setP(r.data);
      setActiveImg(r.data.imagen_principal);
      api.post(`/products/${slug}/view`).catch(() => {});
      api.get(`/products?sistema=${r.data.sistema}&limit=8`).then((r2) => {
        setRelated((r2.data.items || []).filter((x) => x.id !== r.data.id).slice(0, 4));
      });
    }).catch(() => setP(false));
  }, [slug]);

  if (p === null) return <div className="min-h-[60vh] grid place-items-center font-display uppercase tracking-widest">Cargando...</div>;
  if (p === false) return (
    <div className="min-h-[60vh] grid place-items-center text-center px-4">
      <div>
        <p className="font-display font-black text-3xl uppercase">Producto no encontrado</p>
        <Link to="/catalogo" className="mt-4 inline-flex items-center gap-2 text-zetor-red font-bold uppercase tracking-widest"><ArrowLeft className="h-4 w-4" /> Volver al catálogo</Link>
      </div>
    </div>
  );

  const gallery = [p.imagen_principal, ...(p.galeria || [])].filter(Boolean);

  return (
    <div className="bg-white" data-testid="product-detail-page">
      <div className="bg-zinc-50 border-b border-zinc-200">
        <div className="mx-auto max-w-7xl px-4 py-3 text-xs flex items-center gap-2 uppercase tracking-widest text-zinc-500">
          <Link to="/" className="hover:text-zetor-red">Inicio</Link><ChevronRight className="h-3 w-3" />
          <Link to="/catalogo" className="hover:text-zetor-red">Catálogo</Link><ChevronRight className="h-3 w-3" />
          <Link to={`/catalogo?sistema=${p.sistema}`} className="hover:text-zetor-red">{SYS_LABELS[p.sistema]}</Link><ChevronRight className="h-3 w-3" />
          <span className="text-carbon truncate">{p.nombre}</span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 lg:py-14 grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7">
          <div className="aspect-square bg-zinc-100 rounded-sm overflow-hidden border border-zinc-200">
            {activeImg ? (
              <img src={withSmartCrop(activeImg, 1200)} alt={p.nombre} className="h-full w-full object-cover" data-testid="product-main-image" onError={(e) => {
                const fb = {motor: "https://images.unsplash.com/photo-1759850425725-41216a62b6e0?crop=entropy&cs=srgb&fm=jpg&q=80&w=1200", hidraulico: "https://images.unsplash.com/photo-1759692071969-c32285cffc40?crop=entropy&cs=srgb&fm=jpg&q=80&w=1200", transmision: "https://images.unsplash.com/photo-1667339240140-1aee60bea0e5?crop=entropy&cs=srgb&fm=jpg&q=80&w=1200", frenos: "https://images.unsplash.com/photo-1770705950498-d373e33ecb1a?crop=entropy&cs=srgb&fm=jpg&q=80&w=1200", filtros: "https://images.unsplash.com/photo-1776856793085-5cfc8fefb5b8?crop=entropy&cs=srgb&fm=jpg&q=80&w=1200"}[p.sistema];
                if (fb && e.currentTarget.src !== fb) e.currentTarget.src = fb;
              }} />
            ) : (
              <div className="h-full w-full grid place-items-center text-zinc-400 uppercase text-sm">Sin imagen</div>
            )}
          </div>
          {gallery.length > 1 && (
            <div className="mt-3 grid grid-cols-5 gap-2">
              {gallery.map((url, i) => (
                <button key={i} onClick={() => setActiveImg(url)} className={`aspect-square overflow-hidden rounded-sm border ${activeImg === url ? "border-zetor-red border-2" : "border-zinc-200"}`} data-testid={`product-thumb-${i}`}>
                  <img src={withSmartCrop(url)} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-5">
          <span className="inline-block bg-carbon text-white text-[10px] uppercase tracking-widest px-2 py-1 font-bold">{SYS_LABELS[p.sistema]}</span>
          <h1 className="mt-3 font-display font-black uppercase text-3xl sm:text-4xl lg:text-5xl tracking-tighter text-carbon" data-testid="product-name">{p.nombre}</h1>
          <p className="mt-2 text-sm font-bold uppercase tracking-widest text-zinc-500">SKU · <span className="text-carbon">{p.sku}</span></p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="border border-zinc-200 p-3 rounded-sm">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Disponibilidad</p>
              <p className="mt-1 font-bold text-sm text-emerald-600">{p.disponibilidad}</p>
            </div>
            <div className="border border-zinc-200 p-3 rounded-sm">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Sistema</p>
              <p className="mt-1 font-bold text-sm text-carbon">{SYS_LABELS[p.sistema]}</p>
            </div>
          </div>

          <div className="mt-5">
            <p className="text-[10px] uppercase tracking-widest text-zetor-red font-bold mb-2">Compatible con</p>
            <div className="flex flex-wrap gap-2">
              {(p.compatibilidad || []).map((m) => (
                <Link key={m} to={`/modelo/${m}`} className="text-xs font-bold border border-carbon text-carbon px-2.5 py-1.5 hover:bg-carbon hover:text-white uppercase tracking-widest rounded-sm">Zetor {m}</Link>
              ))}
            </div>
          </div>

          {p.descripcion && (
            <div className="mt-6">
              <h3 className="text-xs uppercase font-bold tracking-widest text-zinc-500 mb-2">Descripción</h3>
              <p className="text-sm leading-relaxed text-zinc-700">{p.descripcion}</p>
            </div>
          )}

          <div className="mt-6 bg-zinc-50 border-l-4 border-zetor-red p-4 rounded-sm" data-testid="product-trust-message">
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-zetor-red shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm uppercase tracking-wider text-carbon">Validamos compatibilidad antes de despachar</p>
                <p className="text-xs text-zinc-600 mt-1 leading-relaxed">{p.observacion_tecnica || "Antes de despachar confirmamos compatibilidad con tu modelo y número de chasis."}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid sm:grid-cols-2 gap-3">
            <input value={modelo} onChange={(e) => setModelo(e.target.value)} placeholder="Tu modelo Zetor (ej: 5211)" className="border border-zinc-300 px-3 py-2.5 text-sm rounded-sm" data-testid="product-input-modelo" />
            <input value={ciudad} onChange={(e) => setCiudad(e.target.value)} placeholder="Ciudad" className="border border-zinc-300 px-3 py-2.5 text-sm rounded-sm" data-testid="product-input-ciudad" />
          </div>

          <a
            href={productWhatsAppMessage(p, { modelo, ciudad })}
    target="_blank"
    rel="noopener noreferrer"
    onClick={() => api.post("/contact", { nombre: "WhatsApp", telefono: "desconocido", mensaje: `Click en producto: ${p.nombre}`, tipo: "whatsapp" }).catch(() => {})}
    className="mt-3 w-full inline-flex items-center justify-center gap-2 bg-whatsapp text-white font-bold uppercase tracking-widest px-6 py-4 rounded-sm hover:bg-[#1EBE5A]"
    data-testid="product-whatsapp-cta"
>
          >
            <MessageCircle className="h-5 w-5" /> Cotizar por WhatsApp
          </a>
          <div className="mt-3 grid sm:grid-cols-2 gap-2 text-xs text-zinc-500">
            <a href="tel:+573202453457" className="inline-flex items-center gap-2 hover:text-zetor-red"><Phone className="h-3.5 w-3.5" /> {formatWhatsAppDisplay()}</a>
            <span className="inline-flex items-center gap-2"><Wrench className="h-3.5 w-3.5" /> Asesoría técnica especializada</span>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="bg-zinc-50 py-16">
          <div className="mx-auto max-w-7xl px-4">
            <h2 className="font-display font-black uppercase text-2xl sm:text-3xl tracking-tighter mb-6">Repuestos relacionados</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {related.map((r) => <ProductCard key={r.id} product={r} />)}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
