import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, User } from "lucide-react";
import api from "../lib/api";

export default function Blog() {
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    api.get("/blog/posts").then((r) => setPosts(r.data.items || []));
  }, []);
  const fmt = (iso) => new Date(iso).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div className="bg-white">
      <section className="bg-carbon text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:py-24">
          <p className="text-zetor-red text-xs uppercase tracking-[0.3em] font-bold">Recursos técnicos</p>
          <h1 className="mt-2 font-display font-black uppercase text-5xl sm:text-6xl lg:text-7xl tracking-tighter">Blog</h1>
          <p className="mt-4 text-zinc-300 max-w-2xl">Guías, mantenimiento y conocimiento técnico sobre tractores Zetor.</p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4">
          {posts.length === 0 ? (
            <p className="text-zinc-500">Cargando artículos...</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {posts.map((p) => (
                <Link to={`/blog/${p.slug}`} key={p.id} className="industrial-card rounded-sm overflow-hidden group" data-testid={`blog-card-${p.slug}`}>
                  {p.imagen && (
                    <div className="aspect-[16/10] overflow-hidden">
                      <img src={p.imagen} alt={p.titulo} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {fmt(p.created_at)}</span>
                      <span className="flex items-center gap-1"><User className="h-3 w-3" /> {p.autor}</span>
                    </div>
                    <h2 className="mt-2 font-display font-black uppercase text-xl tracking-tight leading-tight line-clamp-2">{p.titulo}</h2>
                    <p className="mt-2 text-sm text-zinc-600 line-clamp-3">{p.resumen}</p>
                    <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-zetor-red">
                      Leer artículo <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
