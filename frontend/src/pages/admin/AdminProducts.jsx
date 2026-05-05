import React, { useEffect, useRef, useState } from "react";
import { Plus, Pencil, Trash2, X, Upload, Search, Check, ImageIcon } from "lucide-react";
import api from "../../lib/api";

const SYSTEMS = ["motor", "hidraulico", "transmision", "frenos", "filtros"];
const MODELS = ["5511-5545", "5711-5745", "6711-6745", "6911-6945", "7011-7045", "7211-7245", "8011-12045"];

const emptyForm = {
  sku: "",
  nombre: "",
  sistema: "motor",
  categoria_original: "",
  descripcion: "",
  observacion_tecnica: "Antes de despachar validamos compatibilidad con tu modelo y número de chasis.",
  compatibilidad: [],
  imagen_principal: "",
  galeria: [],
  disponibilidad: "Disponible",
  destacado: false,
  activo: true,
};

export default function AdminProducts() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null); // product or null
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);
  const galRef = useRef(null);

  const load = async () => {
    const { data } = await api.get(`/admin/products${q ? `?q=${encodeURIComponent(q)}` : ""}`);
    setItems(data.items || []);
  };
  useEffect(() => { load(); }, []);

  const startNew = () => { setEditing(null); setForm(emptyForm); setOpen(true); };
  const startEdit = (p) => {
    setEditing(p);
    setForm({
      sku: p.sku, nombre: p.nombre, sistema: p.sistema, categoria_original: p.categoria_original || "",
      descripcion: p.descripcion || "", observacion_tecnica: p.observacion_tecnica || "",
      compatibilidad: p.compatibilidad || [], imagen_principal: p.imagen_principal || "",
      galeria: p.galeria || [], disponibilidad: p.disponibilidad || "Disponible",
      destacado: !!p.destacado, activo: p.activo !== false,
    });
    setOpen(true);
  };

  const upload = async (file, target = "imagen_principal") => {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await api.post("/admin/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      const fullUrl = `${process.env.REACT_APP_BACKEND_URL}${data.url}`;
      if (target === "imagen_principal") setForm((f) => ({ ...f, imagen_principal: fullUrl }));
      else setForm((f) => ({ ...f, galeria: [...(f.galeria || []), fullUrl] }));
    } catch (e) {
      alert("Error al subir imagen");
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/admin/products/${editing.id}`, form);
      } else {
        await api.post("/admin/products", form);
      }
      setOpen(false);
      await load();
    } catch (err) {
      alert(err.response?.data?.detail || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const del = async (p) => {
    if (!window.confirm(`¿Eliminar ${p.nombre}?`)) return;
    await api.delete(`/admin/products/${p.id}`);
    await load();
  };

  const toggleCompat = (m) => setForm((f) => ({ ...f, compatibilidad: f.compatibilidad.includes(m) ? f.compatibilidad.filter((x) => x !== m) : [...f.compatibilidad, m] }));

  return (
    <div>
      <div className="flex items-center justify-between gap-3 flex-wrap mb-5">
        <div>
          <h1 className="font-display font-black uppercase text-3xl tracking-tighter">Productos</h1>
          <p className="text-sm text-zinc-600">{items.length} productos</p>
        </div>
        <button onClick={startNew} className="inline-flex items-center gap-2 bg-zetor-red text-white font-bold uppercase tracking-widest px-4 py-2.5 rounded-sm hover:bg-[#B91820]" data-testid="admin-product-new">
          <Plus className="h-4 w-4" /> Nuevo producto
        </button>
      </div>

      <div className="bg-white border border-zinc-200 rounded-sm p-4 mb-4 flex items-center gap-2">
        <Search className="h-4 w-4 text-zinc-500" />
        <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load()} placeholder="Buscar..." className="bg-transparent outline-none text-sm w-full" data-testid="admin-product-search" />
        <button onClick={load} className="text-xs font-bold uppercase tracking-widest border border-zinc-300 px-3 py-1.5 rounded-sm">Buscar</button>
      </div>

      <div className="bg-white border border-zinc-200 rounded-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-zinc-100 text-zinc-600 uppercase text-[10px] tracking-widest">
            <tr>
              <th className="text-left px-4 py-3">Producto</th>
              <th className="text-left px-4 py-3">SKU</th>
              <th className="text-left px-4 py-3">Sistema</th>
              <th className="text-left px-4 py-3">Compatib.</th>
              <th className="text-left px-4 py-3">Estado</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="border-t border-zinc-100 hover:bg-zinc-50" data-testid={`admin-product-row-${p.sku}`}>
                <td className="px-4 py-3 flex items-center gap-3">
                  {p.imagen_principal ? <img src={p.imagen_principal} alt="" className="h-10 w-10 object-cover rounded-sm" /> : <div className="h-10 w-10 bg-zinc-100 grid place-items-center"><ImageIcon className="h-4 w-4 text-zinc-400" /></div>}
                  <span className="font-bold">{p.nombre}</span>
                </td>
                <td className="px-4 py-3 text-zinc-600 font-mono text-xs">{p.sku}</td>
                <td className="px-4 py-3 capitalize">{p.sistema}</td>
                <td className="px-4 py-3">{(p.compatibilidad || []).map((m) => `Z${m}`).join(", ")}</td>
                <td className="px-4 py-3">
                  {p.activo ? <span className="text-emerald-600 font-bold text-xs uppercase">Activo</span> : <span className="text-zinc-400 text-xs uppercase">Inactivo</span>}
                  {p.destacado && <span className="ml-2 bg-zetor-red text-white text-[10px] uppercase tracking-widest px-1.5 py-0.5">Destacado</span>}
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <button onClick={() => startEdit(p)} className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest border border-zinc-300 px-2 py-1 rounded-sm hover:border-carbon" data-testid={`admin-product-edit-${p.sku}`}><Pencil className="h-3 w-3" /> Editar</button>
                  <button onClick={() => del(p)} className="ml-2 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest border border-red-200 text-red-600 px-2 py-1 rounded-sm hover:bg-red-600 hover:text-white" data-testid={`admin-product-delete-${p.sku}`}><Trash2 className="h-3 w-3" /> Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/60 grid place-items-center p-4 overflow-y-auto" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-sm w-full max-w-3xl border border-zinc-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-zinc-200">
              <h2 className="font-display font-black uppercase text-xl tracking-tight">{editing ? "Editar producto" : "Nuevo producto"}</h2>
              <button onClick={() => setOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={submit} className="p-5 grid sm:grid-cols-2 gap-4 max-h-[75vh] overflow-y-auto" data-testid="admin-product-form">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">SKU*</label>
                <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} required className="mt-1 w-full border border-zinc-300 px-3 py-2 text-sm rounded-sm" data-testid="admin-form-sku" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Nombre*</label>
                <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required className="mt-1 w-full border border-zinc-300 px-3 py-2 text-sm rounded-sm" data-testid="admin-form-nombre" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Sistema</label>
                <select value={form.sistema} onChange={(e) => setForm({ ...form, sistema: e.target.value })} className="mt-1 w-full border border-zinc-300 px-3 py-2 text-sm rounded-sm bg-white" data-testid="admin-form-sistema">
                  {SYSTEMS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Categoría original</label>
                <input value={form.categoria_original} onChange={(e) => setForm({ ...form, categoria_original: e.target.value })} className="mt-1 w-full border border-zinc-300 px-3 py-2 text-sm rounded-sm" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Compatibilidad</label>
                <div className="mt-1 flex gap-2 flex-wrap">
                  {MODELS.map((m) => (
                    <button type="button" key={m} onClick={() => toggleCompat(m)} className={`px-3 py-1.5 text-xs font-bold uppercase tracking-widest border rounded-sm ${form.compatibilidad.includes(m) ? "bg-zetor-red text-white border-zetor-red" : "border-zinc-300"}`}>
                      {form.compatibilidad.includes(m) && <Check className="h-3 w-3 inline mr-1" />}{m}
                    </button>
                  ))}
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Descripción</label>
                <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} rows={3} className="mt-1 w-full border border-zinc-300 px-3 py-2 text-sm rounded-sm" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Observación técnica</label>
                <textarea value={form.observacion_tecnica} onChange={(e) => setForm({ ...form, observacion_tecnica: e.target.value })} rows={2} className="mt-1 w-full border border-zinc-300 px-3 py-2 text-sm rounded-sm" />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Imagen principal</label>
                <div className="mt-1 flex items-center gap-3">
                  {form.imagen_principal && <img src={form.imagen_principal} alt="" className="h-16 w-16 object-cover rounded-sm" />}
                  <input ref={fileRef} type="file" accept="image/*" onChange={(e) => upload(e.target.files?.[0], "imagen_principal")} className="hidden" />
                  <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="inline-flex items-center gap-2 border border-zinc-300 px-3 py-2 text-xs font-bold uppercase tracking-widest rounded-sm" data-testid="admin-upload-main">
                    <Upload className="h-3.5 w-3.5" /> {uploading ? "Subiendo..." : "Subir imagen"}
                  </button>
                  <input value={form.imagen_principal} onChange={(e) => setForm({ ...form, imagen_principal: e.target.value })} placeholder="O pega URL" className="border border-zinc-300 px-3 py-2 text-sm rounded-sm flex-1 min-w-[160px]" />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Galería ({form.galeria.length})</label>
                <div className="mt-1 flex items-center gap-2 flex-wrap">
                  {form.galeria.map((url, i) => (
                    <div key={i} className="relative">
                      <img src={url} alt="" className="h-14 w-14 object-cover rounded-sm border" />
                      <button type="button" onClick={() => setForm({ ...form, galeria: form.galeria.filter((_, j) => j !== i) })} className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full h-5 w-5 grid place-items-center text-[10px]"><X className="h-3 w-3" /></button>
                    </div>
                  ))}
                  <input ref={galRef} type="file" accept="image/*" onChange={(e) => upload(e.target.files?.[0], "galeria")} className="hidden" />
                  <button type="button" onClick={() => galRef.current?.click()} className="inline-flex items-center gap-2 border border-dashed border-zinc-300 px-3 py-2 text-xs font-bold uppercase tracking-widest rounded-sm">
                    <Upload className="h-3.5 w-3.5" /> Añadir
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">Disponibilidad</label>
                <select value={form.disponibilidad} onChange={(e) => setForm({ ...form, disponibilidad: e.target.value })} className="mt-1 w-full border border-zinc-300 px-3 py-2 text-sm rounded-sm bg-white">
                  <option>Disponible</option>
                  <option>Bajo pedido</option>
                  <option>Agotado</option>
                </select>
              </div>
              <div className="flex items-center gap-4 mt-7">
                <label className="inline-flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.destacado} onChange={(e) => setForm({ ...form, destacado: e.target.checked })} /> Destacado
                </label>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.activo} onChange={(e) => setForm({ ...form, activo: e.target.checked })} /> Activo
                </label>
              </div>

              <div className="sm:col-span-2 flex items-center justify-end gap-3 pt-4 border-t border-zinc-200">
                <button type="button" onClick={() => setOpen(false)} className="text-sm font-bold uppercase tracking-widest text-zinc-600">Cancelar</button>
                <button disabled={saving} type="submit" className="inline-flex items-center gap-2 bg-zetor-red text-white font-bold uppercase tracking-widest px-5 py-2.5 rounded-sm hover:bg-[#B91820] disabled:opacity-60" data-testid="admin-product-save">
                  {saving ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
