import React from "react";
import { Link } from "react-router-dom";
import { MessageCircle, ShieldCheck, ClipboardCheck, Truck, Wrench, Phone } from "lucide-react";
import { generalWhatsAppMessage, formatWhatsAppDisplay } from "../lib/whatsapp";

export default function Asesoria() {
  return (
    <div className="bg-white">
      <section className="bg-carbon text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:py-24 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-zetor-red text-xs uppercase tracking-[0.3em] font-bold">Asistencia técnica</p>
            <h1 className="mt-2 font-display font-black uppercase text-5xl sm:text-6xl lg:text-7xl tracking-tighter leading-[0.9]">
              Asesoría<br /><span className="text-zetor-red">Especializada</span>
            </h1>
            <p className="mt-5 text-zinc-300 max-w-xl">
              Más que un almacén de repuestos: somos mecánicos que entendemos cada referencia, cada sistema y cada modelo Zetor. Te ayudamos a evitar compras equivocadas y diagnósticos errados.
            </p>
            <a href={generalWhatsAppMessage("Necesito asesoría técnica.")} target="_blank" rel="noopener noreferrer" className="mt-7 inline-flex items-center gap-2 bg-whatsapp text-white font-bold uppercase tracking-widest px-6 py-4 rounded-sm hover:bg-[#1EBE5A]" data-testid="asesoria-whatsapp-cta">
              <MessageCircle className="h-5 w-5" /> Hablar con un experto
            </a>
          </div>
          <div className="aspect-[4/5] rounded-sm overflow-hidden">
            <img src="https://images.unsplash.com/photo-1770705950498-d373e33ecb1a?crop=entropy&cs=srgb&fm=jpg&q=80&w=1200" alt="Asesoría técnica Zetor" className="h-full w-full object-cover" />
          </div>
        </div>
      </section>

      <section className="py-20 bg-zinc-50">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="font-display font-black uppercase text-3xl sm:text-4xl tracking-tighter">¿Qué incluye nuestra asesoría?</h2>
          <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: ShieldCheck, t: "Validación de compatibilidad", d: "Antes de despachar verificamos compatibilidad por número de chasis y modelo." },
              { icon: ClipboardCheck, t: "Diagnóstico por WhatsApp", d: "Envíanos fotos o video del repuesto y te indicamos referencia exacta." },
              { icon: Wrench, t: "Sugerencia técnica", d: "Recomendamos repuestos alternativos cuando se ajustan a tu presupuesto." },
              { icon: Truck, t: "Envíos a Colombia", d: "Despachamos a todo el país con guía y seguimiento por transportadora." },
            ].map(({ icon: Icon, t, d }, i) => (
              <div key={i} className="industrial-card p-6 rounded-sm" data-testid={`asesoria-feature-${i}`}>
                <Icon className="h-7 w-7 text-zetor-red" />
                <h3 className="mt-4 font-display font-black uppercase text-xl tracking-tight">{t}</h3>
                <p className="mt-2 text-sm text-zinc-600 leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="font-display font-black uppercase text-3xl sm:text-4xl tracking-tighter">Cómo solicitar asesoría</h2>
          <ol className="mt-8 space-y-5">
            {[
              { t: "Identifica tu tractor", d: "Ten a mano modelo (5211, 6211, 7211, 8011) y número de chasis si es posible." },
              { t: "Toma fotos del repuesto", d: "Foto del repuesto desmontado, vista del sistema afectado y referencia visible." },
              { t: "Escríbenos por WhatsApp", d: "Envía la información y nuestro equipo técnico te responde con la referencia correcta." },
              { t: "Cotización y validación", d: "Te enviamos opciones de cotización tras confirmar compatibilidad." },
            ].map((s, i) => (
              <li key={i} className="flex gap-5 border-l-4 border-zetor-red pl-5 py-2">
                <span className="font-display font-black text-4xl text-zetor-red leading-none w-12">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="font-display font-black uppercase text-xl tracking-tight">{s.t}</h3>
                  <p className="mt-1 text-zinc-600">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <a href={generalWhatsAppMessage("Necesito asesoría técnica.")} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 bg-whatsapp text-white font-bold uppercase tracking-widest px-6 py-4 rounded-sm hover:bg-[#1EBE5A]"><MessageCircle className="h-5 w-5" /> Solicitar asesoría</a>
            <a href="tel:+573202453457" className="inline-flex items-center justify-center gap-2 border-2 border-carbon text-carbon font-bold uppercase tracking-widest px-6 py-4 rounded-sm hover:bg-carbon hover:text-white"><Phone className="h-5 w-5" /> Llamar {formatWhatsAppDisplay()}</a>
          </div>
        </div>
      </section>
    </div>
  );
}
