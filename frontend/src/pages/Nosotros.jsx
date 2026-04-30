import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Phone, MessageCircle, Award, Users, Truck } from "lucide-react";
import { generalWhatsAppMessage, formatWhatsAppDisplay } from "../lib/whatsapp";

export default function Nosotros() {
  return (
    <div className="bg-white">
      <section className="bg-carbon text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:py-24">
          <p className="text-zetor-red text-xs uppercase tracking-[0.3em] font-bold">Quiénes somos</p>
          <h1 className="mt-2 font-display font-black uppercase text-5xl sm:text-6xl lg:text-7xl tracking-tighter">Nosotros</h1>
          <p className="mt-5 text-zinc-300 max-w-2xl text-lg">
            Somos un equipo nacido del taller, no del comercio. Cada decisión sobre nuestro inventario y asesoría parte de la experiencia real reparando tractores Zetor en Colombia.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <div className="aspect-[4/5] rounded-sm overflow-hidden">
              <img src="https://images.unsplash.com/photo-1776856793085-5cfc8fefb5b8?crop=entropy&cs=srgb&fm=jpg&q=80&w=1200" alt="Tractor Zetor en campo" className="h-full w-full object-cover" />
            </div>
          </div>
          <div className="lg:col-span-7">
            <h2 className="font-display font-black uppercase text-3xl sm:text-4xl tracking-tighter">Del taller al almacén</h2>
            <p className="mt-5 text-zinc-700 leading-relaxed">
              El fundador de Almacén de Repuestos Zetor trabajó como mecánico de tractores durante más de tres décadas. Esa trayectoria nos enseñó algo simple: el problema no siempre es encontrar el repuesto, es encontrar el repuesto correcto. Por eso decidimos abrir un almacén que opera con criterio técnico — con asesoría real, no scripts de venta.
            </p>
            <p className="mt-4 text-zinc-700 leading-relaxed">
              Hoy importamos referencias originales de los principales sistemas del tractor Zetor (motor, hidráulico, transmisión, frenos y filtros) y atendemos a fincas, talleres y mecánicos en todo Colombia.
            </p>
            <div className="mt-8 grid sm:grid-cols-3 gap-4">
              {[
                { icon: Award, t: "30+", s: "Años de experiencia técnica" },
                { icon: Users, t: "5000+", s: "Clientes atendidos" },
                { icon: Truck, t: "Colombia", s: "Cobertura nacional" },
              ].map(({ icon: Icon, t, s }, i) => (
                <div key={i} className="border border-zinc-200 p-5 rounded-sm" data-testid={`nosotros-stat-${i}`}>
                  <Icon className="h-6 w-6 text-zetor-red" />
                  <p className="mt-3 font-display font-black text-3xl tracking-tighter">{t}</p>
                  <p className="text-xs uppercase tracking-widest text-zinc-500 mt-1">{s}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-zinc-50">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="font-display font-black uppercase text-3xl sm:text-4xl tracking-tighter">Nuestros valores</h2>
          <div className="mt-10 grid md:grid-cols-3 gap-4">
            {[
              { t: "Honestidad técnica", d: "No vendemos lo que no necesitas. Recomendamos según tu caso real." },
              { t: "Compromiso con el campo", d: "Sabemos que un tractor parado es producción detenida. Por eso priorizamos." },
              { t: "Asesoría como servicio", d: "Antes, durante y después de la compra. La asesoría no termina al despachar." },
            ].map((v, i) => (
              <div key={i} className="bg-white industrial-card p-6 rounded-sm">
                <h3 className="font-display font-black uppercase text-xl tracking-tight">{v.t}</h3>
                <p className="mt-2 text-zinc-600 text-sm leading-relaxed">{v.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-zetor-red text-white">
        <div className="mx-auto max-w-7xl px-4 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="font-display font-black uppercase text-4xl sm:text-5xl tracking-tighter">Visítanos en Bogotá</h2>
            <p className="mt-4 text-white/90 max-w-xl">
              Ven a conocer nuestro almacén o llámanos. Atendemos consultas técnicas y despachamos a todo el país.
            </p>
            <div className="mt-6 space-y-2 text-sm">
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Calle 19B 35-2, Bogotá, Colombia</p>
              <p className="flex items-center gap-2"><Phone className="h-4 w-4" /> {formatWhatsAppDisplay()}</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 lg:justify-end">
            <a href={generalWhatsAppMessage()} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 bg-whatsapp text-white font-bold uppercase tracking-widest px-6 py-4 rounded-sm hover:bg-[#1EBE5A]"><MessageCircle className="h-5 w-5" /> Cotizar</a>
            <Link to="/contacto" className="inline-flex items-center justify-center gap-2 bg-carbon text-white font-bold uppercase tracking-widest px-6 py-4 rounded-sm">Ir a Contacto</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
