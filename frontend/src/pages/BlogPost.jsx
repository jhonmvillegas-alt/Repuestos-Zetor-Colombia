import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, User, MessageCircle } from "lucide-react";
import api from "../lib/api";
import { generalWhatsAppMessage } from "../lib/whatsapp";

export default function BlogPost() {
  const { slug } = useParams();
  const [p, setP] = useState(null);

  useEffect(() => {
    setP(null);
    api.get(`/blog/posts/${slug}`).then((r) => {
      setP(r.data);
      api.post(`/blog/posts/${slug}/view`).catch(() => {});
    }).catch(() => setP(false));
  }, [slug]);

  if (p === null) return <div className="min-h-[60vh] grid place-items-center">Cargando...</div>;
  if (p === false) return (
    <div className="min-h-[60vh] grid place-items-center">
      <div className="text-center">
        <p className="font-display font-black text-3xl uppercase">Artículo no encontrado</p>
        <Link to="/blog" className="mt-3 inline-flex items-center gap-2 text-zetor-red font-bold uppercase tracking-widest"><ArrowLeft className="h-4 w-4" /> Volver al blog</Link>
      </div>
    </div>
  );

  const fmt = (iso) => new Date(iso).toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" });

  const handleWhatsApp = () => {
    api.post("/contact", {
      nombre: "WhatsApp",
      telefono: "desconocido",
      mensaje: `Click en WhatsApp desde Blog: ${p.titulo}`,
      tipo: "whatsapp",
    }).catch(() => {});
  };

  return (
    <article className="bg-white">
      {p.imagen && (
        <div className="relative aspect-[21/9] bg-carbon">
          <img src={p.imagen} alt={p.titulo} className="absolute inset-0 h-full w-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-t from-carbon via-carbon/50 to-transparent" />
        </div>
      )}
      <div className="mx-auto max-w-3xl px-4 py-14">
        <Link to="/blog" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-zetor-red"><ArrowLeft className="h-3.5 w-3.5" /> Blog</Link>
        <h1 className="mt-4 font-display font-black uppercase text-4xl sm:text-5xl tracking-tighter leading-[1.05]" data-testid="blog-post-title">{p.titulo}</h1>
        <div className="mt-4 flex items-center gap-4 text-xs uppercase tracking-widest text-zinc-500 font-bold">
          <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {fmt(p.created_at)}</span>
          <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" /> {p.autor}</span>
        </div>
        <p className="mt-8 text-lg text-zinc-700 leading-relaxed font-medium">{p.resumen}</p>
        <div className="mt-6 prose prose-zinc max-w-none whitespace-pre-line text-base leading-relaxed text-zinc-800">{p.contenido}</div>
        <div className="mt-12 bg-zinc-50 border-l-4 border-zetor-red p-6 rounded-sm">
          <h3 className="font-display font-black uppercase text-xl tracking-tight">¿Necesitas asesoría?</h3>
          <p className="mt-1 text-sm text-zinc-600">Habla con nuestro equipo técnico. Validamos compatibilidad antes de cotizar.</p>
          <a href={generalWhatsAppMessage()} target="_blank" rel="noopener noreferrer" onClick={handleWhatsApp} className="mt-4 inline-flex items-center gap-2 bg-whatsapp text-white font-bold uppercase tracking-widest px-5 py-3 rounded-sm hover:bg-[#1EBE5A]" data-testid="blog-whatsapp-cta"><MessageCircle className="h-4 w-4" /> Cotizar por WhatsApp</a>
        </div>
      </div>
    </article>
  );
}
