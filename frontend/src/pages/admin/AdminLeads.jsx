import React, { useEffect, useState } from "react";
import { Trash2, MessageCircle, Mail, Phone } from "lucide-react";
import api from "../../lib/api";

export default function AdminLeads() {
  const [items, setItems] = useState([]);
  const load = async () => {
    const { data } = await api.get("/admin/leads");
    setItems(data.items || []);
  };
  useEffect(() => { load(); }, []);
  const del = async (id) => {
    if (!window.confirm("¿Eliminar lead?")) return;
    await api.delete(`/admin/leads/${id}`);
    await load();
  };
  const fmt = (iso) => new Date(iso).toLocaleString("es-CO");

  return (
    <div>
      <h1 className="font-display font-black uppercase text-3xl tracking-tighter">Leads</h1>
      <p className="text-sm text-zinc-600 mb-5">{items.length} solicitudes recibidas</p>

      <div className="bg-white border border-zinc-200 rounded-sm divide-y divide-zinc-100">
        {items.length === 0 && <p className="p-5 text-sm text-zinc-500">Sin leads aún.</p>}
        {items.map((l) => (
          <div key={l.id} className="p-5 flex flex-col md:flex-row md:items-start gap-4" data-testid={`admin-lead-${l.id}`}>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <p className="font-display font-black uppercase tracking-tight text-lg">{l.nombre}</p>
                <span className="text-[10px] uppercase tracking-widest bg-zinc-100 px-2 py-0.5 rounded-sm">{fmt(l.created_at)}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-600">
                <a href={`tel:${l.telefono}`} className="flex items-center gap-1 hover:text-zetor-red"><Phone className="h-3.5 w-3.5" /> {l.telefono}</a>
                {l.email && <a href={`mailto:${l.email}`} className="flex items-center gap-1 hover:text-zetor-red"><Mail className="h-3.5 w-3.5" /> {l.email}</a>}
                {l.ciudad && <span>· {l.ciudad}</span>}
                {l.modelo_tractor && <span>· {l.modelo_tractor}</span>}
              </div>
              <p className="mt-3 text-sm bg-zinc-50 border-l-2 border-zetor-red pl-3 py-2">{l.mensaje}</p>
            </div>
            <div className="flex md:flex-col gap-2">
              <a href={`https://wa.me/${l.telefono.replace(/\D/g, "")}?text=${encodeURIComponent(`Hola ${l.nombre}, gracias por contactarnos. Estamos validando tu consulta...`)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 bg-whatsapp text-white text-xs font-bold uppercase tracking-widest px-3 py-2 rounded-sm hover:bg-[#1EBE5A]"><MessageCircle className="h-3.5 w-3.5" /> Responder</a>
              <button onClick={() => del(l.id)} className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest border border-red-200 text-red-600 px-3 py-2 rounded-sm"><Trash2 className="h-3.5 w-3.5" /> Eliminar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
