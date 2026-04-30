import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import api from "../../lib/api";

const empty = { titulo: "", resumen: "", contenido: "", imagen: "", autor: "Equipo Zetor", tags: [], publicado: true };

export default function AdminBlog() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await api.get("/admin/blog");
    setItems(data.items || []);
  };
  useEffect(() => { load(); }, []);

  const startNew = () => { setEditing(null); setForm(empty); setOpen(true); };
  const startEdit = (p) => { setEditing(p); setForm({ ...empty, ...p, tags: p.tags || [] }); setOpen(true); };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) await api.put(`/admin/blog/${editing.id}`, form);
      else await api.post("/admin/blog", form);
      setOpen(false);
      await load();
    } catch (err) {
      alert(err.response?.data?.detail || "Error");
    } finally { setSaving(false); }
  };

  const del = async (p) => {
    if (!window.confirm(`¿Eliminar "${p.titulo}"?`)) return;
    await api.delete(`/admin/blog/${p.id}`);
    await load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-display font-black uppercase text-3xl tracking-tighter">Blog</h1>
        <button onClick={startNew} className="inline-flex items-center gap-2 bg-zetor-red text-white font-bold uppercase tracking-widest px-4 py-2.5 rounded-sm hover:bg-[#B91820]" data-testid="admin-blog-new"><Plus className="h-4 w-4" /> Nuevo</button>
      </div>

      <div className="bg-white border border-zinc-200 rounded-sm divide-y divide-zinc-100">
        {items.length === 0 && <p className="p-5 text-sm text-zinc-500">Sin artículos.</p>}
        {items.map((p) => (
          <div key={p.id} className="p-4 flex flex-wrap gap-3 items-center justify-between" data-testid={`admin-blog-row-${p.slug}`}>
            <div className="flex items-center gap-3 min-w-0">
              {p.imagen && <img src={p.imagen} alt="" className="h-12 w-12 object-cover rounded-sm" />}
              <div className="min-w-0">
                <p className="font-bold truncate">{p.titulo}</p>
                <p className="text-xs text-zinc-500 truncate">{p.resumen}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => startEdit(p)} className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest border border-zinc-300 px-2 py-1 rounded-sm"><Pencil className="h-3 w-3" /> Editar</button>
              <button onClick={() => del(p)} className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest border border-red-200 text-red-600 px-2 py-1 rounded-sm"><Trash2 className="h-3 w-3" /> Eliminar</button>
            </div>
          </div>
        ))}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/60 grid place-items-center p-4 overflow-y-auto" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-sm w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-zinc-200 flex justify-between items-center">
              <h2 className="font-display font-black uppercase text-xl tracking-tight">{editing ? "Editar artículo" : "Nuevo artículo"}</h2>
              <button onClick={() => setOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={submit} className="p-5 space-y-3 max-h-[75vh] overflow-y-auto">
              <input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} placeholder="Título*" required className="w-full border border-zinc-300 px-3 py-2 text-sm rounded-sm" />
              <input value={form.imagen} onChange={(e) => setForm({ ...form, imagen: e.target.value })} placeholder="URL imagen de portada" className="w-full border border-zinc-300 px-3 py-2 text-sm rounded-sm" />
              <input value={form.autor} onChange={(e) => setForm({ ...form, autor: e.target.value })} placeholder="Autor" className="w-full border border-zinc-300 px-3 py-2 text-sm rounded-sm" />
              <textarea value={form.resumen} onChange={(e) => setForm({ ...form, resumen: e.target.value })} placeholder="Resumen*" required rows={2} className="w-full border border-zinc-300 px-3 py-2 text-sm rounded-sm" />
              <textarea value={form.contenido} onChange={(e) => setForm({ ...form, contenido: e.target.value })} placeholder="Contenido*" required rows={10} className="w-full border border-zinc-300 px-3 py-2 text-sm rounded-sm font-mono" />
              <label className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.publicado} onChange={(e) => setForm({ ...form, publicado: e.target.checked })} /> Publicado
              </label>
              <div className="flex justify-end gap-3 pt-3">
                <button type="button" onClick={() => setOpen(false)} className="text-sm font-bold uppercase tracking-widest text-zinc-600">Cancelar</button>
                <button disabled={saving} type="submit" className="bg-zetor-red text-white font-bold uppercase tracking-widest px-5 py-2.5 rounded-sm hover:bg-[#B91820]">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
