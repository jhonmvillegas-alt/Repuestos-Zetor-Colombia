import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowRight, MessageCircle, Settings, Cog, Wrench, Disc, Filter } from "lucide-react";
import api from "../lib/api";
import ProductCard from "../components/ProductCard";
import { modelWhatsAppMessage } from "../lib/whatsapp";

const MODEL_DETAIL = {
  "5211": { hp: "46 HP", motor: "3.1L · 4 cilindros · natural", caja: "8+2", peso: "2,490 kg", aplicacion: "Pequeñas y medianas fincas, labores ligeras y transporte." },
  "6211": { hp: "62 HP", motor: "3.6L · 4 cilindros · natural", caja: "10+2", peso: "2,920 kg", aplicacion: "Versátil — fincas medianas, taller, arado y siembra." },
  "7211": { hp: "70 HP", motor: "4.5L · 4 cilindros · natural", caja: "10+2", peso: "3,180 kg", aplicacion: "Trabajo medio-pesado, arado de tierra dura, ganadería." },
  "8011": { hp: "80 HP", motor: "4.5L · 4 cilindros · turbo", caja: "10+2", peso: "3,320 kg", aplicacion: "Alta potencia agrícola, trabajos pesados y exportación." },
};

const SYSTEMS = [
  { slug: "motor", label: "Motor", icon: Settings },
  { slug: "hidraulico", label: "Hidráulico", icon: Wrench },
  { slug: "transmision", label: "Transmisión", icon: Cog },
  { slug: "frenos", label: "Frenos", icon: Disc },
  { slug: "filtros", label: "Filtros", icon: Filter },
];

export default function ModeloLanding() {
  const { modelo } = useParams();
  const data = MODEL_DETAIL[modelo];
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (data) api.get(`/products?modelo=${modelo}&limit=12`).then((r) => setProducts(r.data.items || []));
  }, [modelo]);

  if (!data) return <div className="min-h-[60vh] grid place-items-center"><p className="font-display font-black text-3xl uppercase">Modelo no encontrado</p></div>;

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative bg-carbon text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:py-24 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <p className="text-zetor-red text-xs uppercase tracking-[0.3em] font-bold">Modelo Zetor · UR I</p>
            <h1 className="mt-2 font-display font-black uppercase text-5xl sm:text-6xl lg:text-7xl tracking-tighter leading-[0.9]">
              Repuestos<br />Zetor <span className="text-zetor-red">{modelo}</span>
            </h1>
            <p className="mt-5 text-zinc-300 max-w-xl text-base">
              Encuentra todos los repuestos compatibles con el tractor Zetor {modelo}. Asesoría técnica antes de cotizar y validación de compatibilidad por número de chasis.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <Link to={`/catalogo?modelo=${modelo}`} className="inline-flex items-center justify-center gap-2 bg-zetor-red text-white font-bold uppercase text-sm tracking-widest px-6 py-4 rounded-sm hover:bg-[#B91820] transition" data-testid="modelo-cta-catalog">
                Ver catálogo {modelo} <ArrowRight className="h-4 w-4" />
              </Link>
              <a href={modelWhatsAppMessage(modelo)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 bg-whatsapp text-white font-bold uppercase text-sm tracking-widest px-6 py-4 rounded-sm hover:bg-[#1EBE5A]" data-testid="modelo-cta-whatsapp">
                <MessageCircle className="h-4 w-4" /> Cotizar por WhatsApp
              </a>
            </div>
          </div>
          <div className="lg:col-span-5">
            <div className="grid grid-cols-2 gap-3">
              {[
                ["Potencia", data.hp],
                ["Motor", data.motor],
                ["Transmisión", data.caja],
                ["Peso", data.peso],
              ].map(([k, v]) => (
                <div key={k} className="border border-zinc-700 p-4 rounded-sm">
                  <p className="text-[10px] uppercase tracking-widest text-zetor-red font-bold">{k}</p>
                  <p className="mt-1 font-bold text-sm">{v}</p>
                </div>
              ))}
              <div className="col-span-2 border border-zinc-700 p-4 rounded-sm">
                <p className="text-[10px] uppercase tracking-widest text-zetor-red font-bold">Aplicación</p>
                <p className="mt-1 text-sm leading-relaxed text-zinc-300">{data.aplicacion}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sistemas para este modelo */}
      <section className="py-16 bg-zinc-50">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="font-display font-black uppercase text-3xl sm:text-4xl tracking-tighter">Repuestos por sistema · <span className="text-zetor-red">Zetor {modelo}</span></h2>
          <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {SYSTEMS.map((s) => {
              const Icon = s.icon;
              return (
                <Link key={s.slug} to={`/catalogo?sistema=${s.slug}&modelo=${modelo}`} className="industrial-card p-5 rounded-sm flex flex-col gap-3 group" data-testid={`modelo-system-${s.slug}`}>
                  <Icon className="h-6 w-6 text-zetor-red" />
                  <p className="font-display font-black uppercase tracking-tight text-lg">{s.label}</p>
                  <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:text-zetor-red group-hover:translate-x-1 transition" />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Productos compatibles */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-end justify-between mb-6">
            <h2 className="font-display font-black uppercase text-2xl sm:text-3xl tracking-tighter">Repuestos compatibles</h2>
            <Link to={`/catalogo?modelo=${modelo}`} className="text-sm font-bold uppercase tracking-widest border-b-2 border-zetor-red pb-1" data-testid="modelo-view-all">
              Ver todos
            </Link>
          </div>
          {products.length === 0 ? (
            <p className="text-zinc-500">Cargando productos...</p>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
