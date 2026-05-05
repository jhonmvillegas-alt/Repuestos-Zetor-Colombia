import React, { useEffect, useRef, useState } from "react";
import { Save, Upload, RefreshCw, ImageIcon, Video } from "lucide-react";
import api from "../../lib/api";

const SECTIONS = [
  {
    title: "Hero principal (Inicio)",
    description: "Imagen del lado izquierdo y video del lado derecho del banner principal.",
    fields: [
      { key: "hero_left_image", label: "Imagen del hero (izquierda)", type: "image" },
      { key: "hero_right_video", label: "Video del hero (derecha)", type: "video" },
    ],
  },
  {
    title: "Categorías por sistema",
    description: "Imagen que se muestra en cada card del bloque 'Repuestos por sistema' en la home.",
    fields: [
      { key: "system_image_motor", label: "Motor", type: "image" },
      { key: "system_image_hidraulico", label: "Hidráulico", type: "image" },
      { key: "system_image_transmision", label: "Transmisión", type: "image" },
      { key: "system_image_frenos", label: "Frenos", type: "image" },
      { key: "system_image_filtros", label: "Filtros", type: "image" },
    ],
  },
  {
    title: "Asesoría y Nosotros",
    description: "Imágenes que aparecen en las páginas de Asesoría técnica y Nosotros.",
    fields: [
      { key: "about_mechanic_image", label: "Mecánico / Asesoría técnica", type: "image" },
      { key: "about_tractor_image", label: "Tractor en campo / Nosotros", type: "image" },
    ],
  },
];

export default function AdminSettings() {
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedKey, setSavedKey] = useState(null);
  const fileRefs = useRef({});

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/site/settings");
      setValues(data);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const setVal = (k, v) => setValues((s) => ({ ...s, [k]: v }));

  const upload = async (key, file) => {
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    try {
      const { data } = await api.post("/admin/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      const fullUrl = `${process.env.REACT_APP_BACKEND_URL}${data.url}`;
      setVal(key, fullUrl);
    } catch (e) {
      alert("Error al subir el archivo");
    }
  };

  const saveOne = async (key) => {
    setSaving(true);
    try {
      await api.put("/admin/site/settings", { [key]: values[key] });
      setSavedKey(key);
      setTimeout(() => setSavedKey(null), 1800);
    } catch (e) {
      alert("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      await api.put("/admin/site/settings", values);
      setSavedKey("__all__");
      setTimeout(() => setSavedKey(null), 1800);
    } catch (e) {
      alert("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-zinc-500">Cargando configuración...</p>;

  return (
    <div className="max-w-4xl">
      <div className="flex items-start justify-between gap-3 flex-wrap mb-6">
        <div>
          <h1 className="font-display font-black uppercase text-3xl tracking-tighter">Configuración del sitio</h1>
          <p className="mt-1 text-sm text-zinc-600">Reemplaza imágenes del cuerpo del sitio (hero, categorías, asesoría, nosotros).</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="inline-flex items-center gap-2 border border-zinc-300 px-3 py-2 text-xs font-bold uppercase tracking-widest rounded-sm" data-testid="settings-reload">
            <RefreshCw className="h-3.5 w-3.5" /> Recargar
          </button>
          <button onClick={saveAll} disabled={saving} className="inline-flex items-center gap-2 bg-zetor-red text-white font-bold uppercase text-xs tracking-widest px-4 py-2 rounded-sm hover:bg-[#B91820] disabled:opacity-60" data-testid="settings-save-all">
            <Save className="h-3.5 w-3.5" /> {saving ? "Guardando..." : "Guardar todo"}
          </button>
        </div>
      </div>

      {savedKey === "__all__" && (
        <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2 rounded-sm text-sm font-bold uppercase tracking-widest">
          ✓ Configuración guardada correctamente
        </div>
      )}

      <div className="space-y-8">
        {SECTIONS.map((section) => (
          <section key={section.title} className="bg-white border border-zinc-200 rounded-sm p-5">
            <h2 className="font-display font-black uppercase text-xl tracking-tight">{section.title}</h2>
            <p className="text-sm text-zinc-600 mb-4">{section.description}</p>
            <div className="space-y-5">
              {section.fields.map((f) => {
                const v = values[f.key] || "";
                return (
                  <div key={f.key} className="border border-zinc-100 rounded-sm p-3 sm:p-4 bg-zinc-50/60">
                    <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
                      <p className="text-xs font-bold uppercase tracking-widest text-carbon">{f.label}</p>
                      <div className="flex gap-2 items-center">
                        {savedKey === f.key && <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">✓ Guardado</span>}
                        <button onClick={() => saveOne(f.key)} disabled={saving} className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest border border-zinc-300 hover:border-carbon px-2 py-1 rounded-sm disabled:opacity-60" data-testid={`settings-save-${f.key}`}>
                          <Save className="h-3 w-3" /> Guardar
                        </button>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-[160px,1fr] gap-3 items-start">
                      <div className="aspect-square bg-zinc-200 rounded-sm overflow-hidden grid place-items-center">
                        {v ? (
                          f.type === "video" ? (
                            <video src={v} className="h-full w-full object-cover" muted loop autoPlay playsInline />
                          ) : (
                            <img src={v} alt={f.label} className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                          )
                        ) : (
                          f.type === "video" ? <Video className="h-6 w-6 text-zinc-400" /> : <ImageIcon className="h-6 w-6 text-zinc-400" />
                        )}
                      </div>
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={v}
                          onChange={(e) => setVal(f.key, e.target.value)}
                          placeholder={`URL ${f.type === "video" ? "del video" : "de la imagen"}`}
                          className="w-full border border-zinc-300 px-3 py-2 text-xs font-mono rounded-sm"
                          data-testid={`settings-input-${f.key}`}
                        />
                        <div className="flex items-center gap-2 flex-wrap">
                          <input
                            ref={(el) => (fileRefs.current[f.key] = el)}
                            type="file"
                            accept={f.type === "video" ? "video/*" : "image/*"}
                            onChange={(e) => upload(f.key, e.target.files?.[0])}
                            className="hidden"
                          />
                          <button onClick={() => fileRefs.current[f.key]?.click()} className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest bg-carbon text-white px-3 py-1.5 rounded-sm hover:bg-zinc-800" data-testid={`settings-upload-${f.key}`}>
                            <Upload className="h-3 w-3" /> Subir archivo
                          </button>
                          {v && (
                            <a href={v} target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 hover:text-zetor-red">
                              Ver actual
                            </a>
                          )}
                        </div>
                        <p className="text-[10px] text-zinc-500">
                          {f.type === "video" ? "MP4 recomendado · max 10MB" : "PNG, JPG, WEBP · max 10MB"}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <p className="mt-6 text-xs text-zinc-500">
        Tip: los cambios se ven inmediatamente en el sitio público después de guardar (puede requerir recargar la página).
      </p>
    </div>
  );
}
