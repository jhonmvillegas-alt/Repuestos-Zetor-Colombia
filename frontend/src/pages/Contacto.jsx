import React, { useState } from "react";
import { MapPin, Phone, Mail, Clock, MessageCircle, Send, CheckCircle2 } from "lucide-react";
import api from "../lib/api";
import { generalWhatsAppMessage, formatWhatsAppDisplay } from "../lib/whatsapp";

export default function Contacto() {
  const [form, setForm] = useState({ nombre: "", telefono: "", email: "", ciudad: "", modelo_tractor: "", mensaje: "" });
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.nombre || !form.telefono || !form.mensaje) {
      setError("Por favor completa los campos obligatorios.");
      return;
    }
    setSending(true);
    try {
      const payload = { ...form, email: form.email || null, tipo: "formulario" };
      await api.post("/contact", payload);
      setDone(true);
      setForm({ nombre: "", telefono: "", email: "", ciudad: "", modelo_tractor: "", mensaje: "" });
    } catch (err) {
      setError("No pudimos enviar el mensaje. Intenta de nuevo o escríbenos por WhatsApp.");
    } finally {
      setSending(false);
    }
  };

  const handleWhatsApp = () => {
    api.post("/contact", {
      nombre: "WhatsApp",
      telefono: "desconocido",
      mensaje: "Click en WhatsApp desde Contacto",
      tipo: "whatsapp",
    }).catch(() => {});
  };

  return (
    <div className="bg-white">
      <section className="bg-carbon text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:py-20">
          <p className="text-zetor-red text-xs uppercase tracking-[0.3em] font-bold">Hablemos</p>
          <h1 className="mt-2 font-display font-black uppercase text-5xl sm:text-6xl lg:text-7xl tracking-tighter">Contacto</h1>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5 space-y-5">
            <div className="industrial-card p-6 rounded-sm">
              <h3 className="font-display font-black uppercase text-xl tracking-tight">Información de contacto</h3>
              <ul className="mt-4 space-y-3 text-sm">
                <li className="flex items-start gap-3"><MapPin className="h-4 w-4 text-zetor-red mt-0.5" /> Calle 19B 35-2, Bogotá, Colombia</li>
                <li className="flex items-center gap-3"><Phone className="h-4 w-4 text-zetor-red" /> <a href="tel:+573202453457" className="hover:text-zetor-red">{formatWhatsAppDisplay()} (WhatsApp)</a></li>
                <li className="flex items-center gap-3"><Phone className="h-4 w-4 text-zetor-red" /> <a href="tel:+6014689088" className="hover:text-zetor-red">+57 (601) 468 9088 (Fijo)</a></li>
                <li className="flex items-center gap-3"><Mail className="h-4 w-4 text-zetor-red" /> <a href="mailto:zetorrepuestos@gmail.com" className="hover:text-zetor-red">zetorrepuestos@gmail.com</a></li>
                <li className="flex items-start gap-3"><Clock className="h-4 w-4 text-zetor-red mt-0.5" /> Lun – Vie 8:00–17:30 · Sáb 8:00–13:00</li>
              </ul>
              <a href={generalWhatsAppMessage()} target="_blank" rel="noopener noreferrer" onClick={handleWhatsApp} className="mt-5 inline-flex items-center gap-2 bg-whatsapp text-white font-bold uppercase tracking-widest px-5 py-3 rounded-sm hover:bg-[#1EBE5A]" data-testid="contacto-whatsapp-cta">
                <MessageCircle className="h-4 w-4" /> Escribir a WhatsApp
              </a>
            </div>
            <div className="aspect-[4/3] rounded-sm overflow-hidden border border-zinc-200">
              <iframe title="Ubicación Almacén Zetor" src="https://www.google.com/maps?q=Calle%2019B%2035-2%20Bogot%C3%A1&output=embed" className="h-full w-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="industrial-card p-6 sm:p-8 rounded-sm">
              <h2 className="font-display font-black uppercase text-2xl sm:text-3xl tracking-tighter">Envíanos tu consulta</h2>
              <p className="mt-2 text-sm text-zinc-600">Te respondemos en horario laboral. Para urgencias usa WhatsApp.</p>
              {done ? (
                <div className="mt-6 bg-emerald-50 border border-emerald-200 text-emerald-800 p-5 rounded-sm flex items-start gap-3" data-testid="contacto-success">
                  <CheckCircle2 className="h-5 w-5 mt-0.5" />
                  <div>
                    <p className="font-bold uppercase tracking-wider">¡Mensaje enviado!</p>
                    <p className="text-sm">Nuestro equipo te contactará lo antes posible.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={submit} className="mt-6 grid sm:grid-cols-2 gap-4" data-testid="contacto-form">
                  <input value={form.nombre} onChange={(e) => set("nombre", e.target.value)} placeholder="Nombre completo*" className="border border-zinc-300 px-3 py-3 text-sm rounded-sm focus:outline-none focus:border-zetor-red" required data-testid="contacto-input-nombre" />
                  <input value={form.telefono} onChange={(e) => set("telefono", e.target.value)} placeholder="Teléfono / WhatsApp*" className="border border-zinc-300 px-3 py-3 text-sm rounded-sm focus:outline-none focus:border-zetor-red" required data-testid="contacto-input-telefono" />
                  <input value={form.email} onChange={(e) => set("email", e.target.value)} type="email" placeholder="Email (opcional)" className="border border-zinc-300 px-3 py-3 text-sm rounded-sm focus:outline-none focus:border-zetor-red" data-testid="contacto-input-email" />
                  <input value={form.ciudad} onChange={(e) => set("ciudad", e.target.value)} placeholder="Ciudad" className="border border-zinc-300 px-3 py-3 text-sm rounded-sm focus:outline-none focus:border-zetor-red" data-testid="contacto-input-ciudad" />
                  <select value={form.modelo_tractor} onChange={(e) => set("modelo_tractor", e.target.value)} className="border border-zinc-300 px-3 py-3 text-sm rounded-sm focus:outline-none focus:border-zetor-red sm:col-span-2 bg-white" data-testid="contacto-input-modelo">
                    <option value="">Modelo de tractor (opcional)</option>
                    <option value="Zetor 5511-5545">Zetor 5511–5545</option>
                    <option value="Zetor 5711-5745">Zetor 5711–5745</option>
                    <option value="Zetor 6711-6745">Zetor 6711–6745</option>
                    <option value="Zetor 6911-6945">Zetor 6911–6945</option>
                    <option value="Zetor 7011-7045">Zetor 7011–7045</option>
                    <option value="Zetor 7211-7245">Zetor 7211–7245</option>
                    <option value="Zetor 8011-12045">Zetor 8011–12045</option>
                    <option value="Otro">Otro</option>
                  </select>
                  <textarea value={form.mensaje} onChange={(e) => set("mensaje", e.target.value)} placeholder="Cuéntanos qué repuesto buscas o tu consulta técnica*" rows={5} className="sm:col-span-2 border border-zinc-300 px-3 py-3 text-sm rounded-sm focus:outline-none focus:border-zetor-red" required data-testid="contacto-input-mensaje" />
                  {error && <p className="sm:col-span-2 text-sm text-red-600">{error}</p>}
                  <button type="submit" disabled={sending} className="sm:col-span-2 inline-flex items-center justify-center gap-2 bg-zetor-red text-white font-bold uppercase tracking-widest px-6 py-3.5 rounded-sm hover:bg-[#B91820] disabled:opacity-60" data-testid="contacto-submit"><Send className="h-4 w-4" /> {sending ? "Enviando..." : "Enviar consulta"}</button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
