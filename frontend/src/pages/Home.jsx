import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Wrench, Settings, Cog, Disc, Filter, MessageCircle, Phone, ShieldCheck, Truck, ClipboardCheck } from "lucide-react";
import api from "../lib/api";
import ProductCard from "../components/ProductCard";
import { generalWhatsAppMessage, modelWhatsAppMessage, formatWhatsAppDisplay } from "../lib/whatsapp";

const SYSTEM_META = {
  motor: { label: "Motor", icon: Settings, img: "https://images.unsplash.com/photo-1759850425725-41216a62b6e0?crop=entropy&cs=srgb&fm=jpg&q=80&w=800" },
  hidraulico: { label: "Hidráulico", icon: Wrench, img: "https://images.unsplash.com/photo-1759692071969-c32285cffc40?crop=entropy&cs=srgb&fm=jpg&q=80&w=800" },
  transmision: { label: "Transmisión", icon: Cog, img: "https://images.unsplash.com/photo-1667339240140-1aee60bea0e5?crop=entropy&cs=srgb&fm=jpg&q=80&w=800" },
  frenos: { label: "Frenos", icon: Disc, img: "https://images.unsplash.com/photo-1770705950498-d373e33ecb1a?crop=entropy&cs=srgb&fm=jpg&q=80&w=800" },
  filtros: { label: "Filtros", icon: Filter, img: "https://images.unsplash.com/photo-1776856793085-5cfc8fefb5b8?crop=entropy&cs=srgb&fm=jpg&q=80&w=800" },
};

const MODEL_META = {
  "5511-5545": { hp: "Serie 55", series: "UR I", desc: "Modelos 5511 a 5545 — finca pequeña y mediana" },
  "5711-5745": { hp: "Serie 57", series: "UR I", desc: "Modelos 5711 a 5745 — uso versátil" },
  "6711-6745": { hp: "Serie 67", series: "UR I", desc: "Modelos 6711 a 6745 — trabajo medio" },
  "6911-6945": { hp: "Serie 69", series: "UR I", desc: "Modelos 6911 a 6945 — alta demanda" },
  "7011-7045": { hp: "Serie 70", series: "UR I", desc: "Modelos 7011 a 7045 — trabajo pesado" },
  "7211-7245": { hp: "Serie 72", series: "UR I", desc: "Modelos 7211 a 7245 — agrícola intensivo" },
  "8011-12045": { hp: "Serie 80–120", series: "UR I", desc: "Modelos 8011 a 12045 — máxima potencia turbo" },
};

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [stats, setStats] = useState({ total: 0 });
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.get("/products?destacado=true&limit=8").then((r) => setFeatured(r.data.items || []));
    api.get("/products?limit=1").then((r) => setStats({ total: r.data.total || 0 }));
    api.get("/categories").then((r) => setCategories(r.data || []));
  }, []);

  const HERO_LEFT_IMG = "https://almacenzetorrepuestos.com/wp-content/uploads/2026/04/Gemini_Generated_Image_n0vlzqn0vlzqn0vl-1-scaled.png";
  const HERO_RIGHT_VIDEO = "https://almacenzetorrepuestos.com/wp-content/uploads/2026/04/Agent_video_Pippit_20260429224100.mp4";

  return (
    <div className="bg-white">
      {/* HERO */}
      <section className="relative bg-carbon" data-testid="hero-section">
        <div className="grid lg:grid-cols-2 min-h-[680px] lg:min-h-[760px]">
          {/* LEFT */}
          <div className="relative overflow-hidden">
            <img
              src={HERO_LEFT_IMG}
              alt="Repuestos Zetor"
              className="absolute inset-0 h-full w-full object-cover"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/30" />
            <div className="relative h-full flex flex-col justify-end p-6 sm:p-10 lg:p-14 z-10">
              <span className="inline-flex w-fit items-center gap-2 bg-zetor-red text-white text-[11px] sm:text-xs uppercase tracking-[0.2em] px-3 py-1.5 font-bold rounded-sm" data-testid="hero-badge">
                <span className="h-1.5 w-1.5 rounded-full bg-white" />
                Importador Oficial · Colombia
              </span>
              <h1 className="mt-5 font-display font-black uppercase text-white leading-[0.92] tracking-tighter text-5xl sm:text-6xl lg:text-7xl xl:text-8xl">
                Repuestos<br />
                <span className="text-zetor-red">Zetor</span><br />
                Originales
              </h1>
              <p className="mt-6 text-zinc-200 max-w-md text-sm sm:text-base leading-relaxed">
                Mecánicos especializados que conocen cada pieza. <span className="text-white font-semibold">Asesoría técnica real</span> antes de cotizar y despachar.
              </p>
              <div className="mt-7 flex flex-col sm:flex-row gap-3 max-w-md">
                <Link
                  to="/catalogo"
                  className="inline-flex items-center justify-center gap-2 bg-zetor-red text-white font-bold uppercase text-sm tracking-widest px-6 py-4 rounded-sm hover:bg-[#B91820] transition"
                  data-testid="hero-cta-catalog"
                >
                  Ver Catálogo Completo <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href={generalWhatsAppMessage()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-whatsapp text-white font-bold uppercase text-sm tracking-widest px-6 py-4 rounded-sm hover:bg-[#1EBE5A] transition"
                  data-testid="hero-cta-whatsapp"
                >
                  <MessageCircle className="h-4 w-4" /> Cotizar por WhatsApp
                </a>
              </div>
              <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-[11px] sm:text-xs uppercase tracking-widest text-zinc-400 font-semibold">
                <span>Motor</span>
                <span className="text-zetor-red">·</span>
                <span>Hidráulico</span>
                <span className="text-zetor-red">·</span>
                <span>Transmisión</span>
                <span className="text-zetor-red">·</span>
                <span>Frenos</span>
                <span className="text-zetor-red">·</span>
                <span>Filtros</span>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="relative bg-carbon overflow-hidden border-l border-zinc-800 min-h-[500px] sm:min-h-[600px] lg:min-h-0">
            <video
              src={HERO_RIGHT_VIDEO}
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 h-full w-full object-cover bg-carbon"
            />
            <div className="absolute inset-0 bg-gradient-to-bl from-black/20 via-transparent to-black/40" />
            <div className="relative z-10 h-full flex flex-col justify-end p-6 sm:p-10 lg:p-14">
              <div className="self-end hidden md:block max-w-[150px] sm:max-w-xs bg-white text-carbon p-2 sm:p-5 rounded-sm border-l-4 border-zetor-red shadow-2xl" data-testid="hero-stat-card">
                <p className="font-display font-black text-lg sm:text-3xl lg:text-4xl leading-none">800+</p>
                <p className="text-[8px] sm:text-[10px] uppercase tracking-widest font-bold text-zinc-600 mt-0.5 sm:mt-1">Referencias disponibles</p>
                <Link to="/asesoria" className="mt-1 sm:mt-3 inline-flex items-center gap-1 text-[9px] sm:text-[11px] uppercase font-bold tracking-widest text-zetor-red hover:underline">
                  Solicitar asesoría <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="section-divider" />
      </section>

      {/* SISTEMA SECTION */}
      <section className="py-20 sm:py-28 bg-white" data-testid="systems-section">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <p className="text-zetor-red text-xs uppercase tracking-[0.3em] font-bold">01 — Catálogo</p>
              <h2 className="mt-2 font-display font-black uppercase text-carbon text-3xl sm:text-4xl lg:text-5xl tracking-tighter">
                Repuestos por <span className="text-zetor-red">sistema</span>
              </h2>
              <p className="mt-3 text-zinc-600 max-w-xl text-sm sm:text-base">
                Encuentra exactamente lo que necesitas navegando por el sistema afectado de tu tractor.
              </p>
            </div>
            <Link to="/catalogo" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-carbon border-b-2 border-zetor-red pb-1 self-start" data-testid="systems-view-all">
              Ver todo el catálogo <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.keys(SYSTEM_META).map((slug) => {
              const m = SYSTEM_META[slug];
              const Icon = m.icon;
              const cat = categories.find((c) => c.slug === slug);
              return (
                <Link
                  key={slug}
                  to={`/catalogo?sistema=${slug}`}
                  className="industrial-card group rounded-sm overflow-hidden flex flex-col"
                  data-testid={`system-card-${slug}`}
                >
                  <div className="aspect-[4/3] relative bg-zinc-100 overflow-hidden">
                    <img src={m.img} alt={m.label} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                    <Icon className="absolute top-3 right-3 h-5 w-5 text-white" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="text-white font-display font-black text-xl uppercase tracking-tight">{m.label}</p>
                    </div>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <span className="text-[11px] uppercase tracking-widest text-zinc-500 font-bold">
                      {cat?.count || 0} refs.
                    </span>
                    <ArrowRight className="h-4 w-4 text-zetor-red transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* MODELS SECTION */}
      <section className="py-20 sm:py-28 bg-zinc-50" data-testid="models-section">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-10">
            <p className="text-zetor-red text-xs uppercase tracking-[0.3em] font-bold">02 — Modelos</p>
            <h2 className="mt-2 font-display font-black uppercase text-carbon text-3xl sm:text-4xl lg:text-5xl tracking-tighter">
              Repuestos por <span className="text-zetor-red">modelo Zetor</span>
            </h2>
            <p className="mt-3 text-zinc-600 max-w-xl text-sm sm:text-base">
              Selecciona tu modelo y accede al listado completo de repuestos compatibles.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.keys(MODEL_META).map((m) => (
              <Link
                key={m}
                to={`/modelo/${m}`}
                className="bg-carbon text-white p-5 sm:p-6 rounded-sm flex flex-col gap-3 group hover:bg-zetor-red transition relative overflow-hidden"
                data-testid={`model-card-${m}`}
              >
                <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-zetor-red/10 group-hover:bg-white/10 transition" />
                <p className="text-zetor-red text-[10px] sm:text-xs uppercase tracking-[0.3em] font-bold group-hover:text-white">Zetor · {MODEL_META[m].series}</p>
                <h3 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl tracking-tighter relative leading-none">{m}</h3>
                <p className="text-xs sm:text-sm text-zinc-300 group-hover:text-white relative">{MODEL_META[m].desc}</p>
                <div className="mt-2 flex items-center justify-between relative">
                  <span className="text-[10px] sm:text-[11px] uppercase tracking-widest font-bold border border-white/30 px-2 py-1">{MODEL_META[m].hp}</span>
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ASESORIA */}
      <section className="py-20 sm:py-28 bg-white relative" data-testid="advisory-section">
        <div className="mx-auto max-w-7xl px-4 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 relative">
            <div className="aspect-[4/5] bg-zinc-100 rounded-sm overflow-hidden relative">
              <img src="https://images.unsplash.com/photo-1770705950498-d373e33ecb1a?crop=entropy&cs=srgb&fm=jpg&q=80&w=1200" alt="Mecánico especialista Zetor" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-transparent" />
            </div>
            <div className="absolute -bottom-6 -right-4 sm:bottom-6 sm:-right-6 bg-zetor-red text-white p-5 sm:p-7 rounded-sm max-w-xs shadow-2xl" data-testid="advisory-badge">
              <p className="font-display font-black text-3xl sm:text-4xl leading-none">+30</p>
              <p className="text-xs uppercase tracking-widest mt-1 opacity-90">Años de experiencia<br />en mecánica Zetor</p>
            </div>
          </div>
          <div className="lg:col-span-6">
            <p className="text-zetor-red text-xs uppercase tracking-[0.3em] font-bold">03 — Asesoría técnica</p>
            <h2 className="mt-2 font-display font-black uppercase text-carbon text-3xl sm:text-4xl lg:text-5xl tracking-tighter">
              Mecánicos reales,<br /><span className="text-zetor-red">no vendedores</span>
            </h2>
            <p className="mt-5 text-zinc-700 leading-relaxed">
              Nuestro fundador trabajó como mecánico de tractores Zetor por décadas. Esa experiencia es la que pones a trabajar cuando consultas con nosotros: identificamos compatibilidad, validamos referencias y te damos recomendaciones técnicas antes de cotizar.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                { icon: ShieldCheck, t: "Validación de compatibilidad antes del despacho" },
                { icon: ClipboardCheck, t: "Diagnóstico técnico por WhatsApp con fotos" },
                { icon: Truck, t: "Envíos a todo Colombia con seguimiento" },
              ].map(({ icon: Icon, t }, i) => (
                <li key={i} className="flex items-start gap-3 text-sm sm:text-base">
                  <span className="h-9 w-9 grid place-items-center bg-carbon text-white rounded-sm shrink-0">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="pt-1.5">{t}</span>
                </li>
              ))}
            </ul>
            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <Link to="/asesoria" className="inline-flex items-center justify-center gap-2 bg-carbon text-white font-bold uppercase text-sm tracking-widest px-6 py-3.5 rounded-sm hover:bg-zetor-red transition" data-testid="advisory-cta-page">
                Conocer la asesoría <ArrowRight className="h-4 w-4" />
              </Link>
              <a href={generalWhatsAppMessage("Necesito asesoría técnica.")} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 bg-whatsapp text-white font-bold uppercase text-sm tracking-widest px-6 py-3.5 rounded-sm hover:bg-[#1EBE5A] transition" data-testid="advisory-cta-whatsapp">
                <MessageCircle className="h-4 w-4" /> Hablar con un experto
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="py-20 sm:py-28 bg-zinc-50" data-testid="featured-section">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <p className="text-zetor-red text-xs uppercase tracking-[0.3em] font-bold">04 — Destacados</p>
              <h2 className="mt-2 font-display font-black uppercase text-carbon text-3xl sm:text-4xl lg:text-5xl tracking-tighter">
                Productos <span className="text-zetor-red">destacados</span>
              </h2>
            </div>
            <Link to="/catalogo" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-carbon border-b-2 border-zetor-red pb-1 self-start" data-testid="featured-view-all">
              Ver todos <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 sm:py-28 bg-carbon text-white" data-testid="how-it-works">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-10">
            <p className="text-zetor-red text-xs uppercase tracking-[0.3em] font-bold">05 — Proceso</p>
            <h2 className="mt-2 font-display font-black uppercase text-3xl sm:text-4xl lg:text-5xl tracking-tighter">
              Cómo <span className="text-zetor-red">funciona</span>
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { n: "01", t: "Consulta", d: "Escríbenos por WhatsApp con la referencia, foto del repuesto o número de chasis." },
              { n: "02", t: "Validación", d: "Validamos compatibilidad con tu modelo Zetor antes de cualquier cotización." },
              { n: "03", t: "Cotización", d: "Te enviamos cotización detallada y opciones según tu presupuesto." },
              { n: "04", t: "Despacho", d: "Despachamos a todo Colombia con guía y seguimiento." },
            ].map((s, i) => (
              <div key={i} className="border border-zinc-800 p-6 rounded-sm hover:border-zetor-red transition group" data-testid={`step-${i + 1}`}>
                <p className="font-display font-black text-5xl text-zetor-red leading-none">{s.n}</p>
                <h3 className="mt-3 font-display font-black uppercase text-xl tracking-tight">{s.t}</h3>
                <p className="mt-2 text-zinc-400 text-sm leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative bg-zetor-red text-white" data-testid="final-cta">
        <div className="bg-diagonal-stripes">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:py-24 grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-white/80 text-xs uppercase tracking-[0.3em] font-bold">¿Necesitas un repuesto urgente?</p>
              <h2 className="mt-3 font-display font-black uppercase text-4xl sm:text-5xl lg:text-6xl tracking-tighter leading-[0.95]">
                Hablemos por<br />WhatsApp
              </h2>
              <p className="mt-5 text-white/90 max-w-md text-base">
                Antes de cotizar validamos compatibilidad con tu modelo. Te respondemos en minutos durante horario hábil.
              </p>
            </div>
            <div className="flex flex-col gap-3 lg:items-end">
              <a
                href={generalWhatsAppMessage()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 bg-whatsapp text-white font-bold uppercase text-base tracking-widest px-8 py-5 rounded-sm hover:bg-[#1EBE5A] transition shadow-2xl"
                data-testid="final-whatsapp-cta"
              >
                <MessageCircle className="h-5 w-5" /> Cotizar por WhatsApp
              </a>
              <a href="tel:+573202453457" className="inline-flex items-center gap-2 text-white font-bold underline-offset-4 hover:underline" data-testid="final-call-cta">
                <Phone className="h-4 w-4" /> {formatWhatsAppDisplay()}
              </a>
              <p className="text-white/80 text-xs uppercase tracking-widest">Calle 19B 35-2 · Bogotá</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
