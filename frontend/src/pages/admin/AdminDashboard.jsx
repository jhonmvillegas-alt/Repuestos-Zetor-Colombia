import React, { useEffect, useState } from "react";
import { Box, FileText, Inbox, Tag, Eye } from "lucide-react";
import api from "../../lib/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, leads: 0, posts: 0, categories: 0 });
  const [recent, setRecent] = useState([]);
  const [topPosts, setTopPosts] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get("/admin/products?limit=200").then((r) => r.data.total).catch(() => 0),
      api.get("/admin/leads").then((r) => r.data.items?.length || 0).catch(() => 0),
      api.get("/admin/blog").then((r) => r.data.items?.length || 0).catch(() => 0),
      api.get("/categories").then((r) => r.data.length).catch(() => 0),
    ]).then(([products, leads, posts, categories]) => setStats({ products, leads, posts, categories }));

    api.get("/admin/leads").then((r) => setRecent((r.data.items || []).slice(0, 5))).catch(() => setRecent([]));

    api.get("/admin/products?limit=200").then((r) => {
      const sorted = (r.data.items || [])
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 5);
      setTopPosts(sorted);
    }).catch(() => setTopPosts([]));
  }, []);

  const cards = [
    { k: "products", t: "Productos", v: stats.products, icon: Box, c: "bg-zetor-red" },
    { k: "leads", t: "Leads recibidos", v: stats.leads, icon: Inbox, c: "bg-carbon" },
    { k: "posts", t: "Artículos blog", v: stats.posts, icon: FileText, c: "bg-zinc-700" },
    { k: "categories", t: "Sistemas", v: stats.categories, icon: Tag, c: "bg-zinc-500" },
  ];

  return (
    <div>
      <h1 className="font-display font-black uppercase text-3xl tracking-tighter">Dashboard</h1>
      <p className="mt-1 text-sm text-zinc-600">Resumen del almacén</p>

      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div key={c.k} className="bg-white border border-zinc-200 rounded-sm p-5" data-testid={`admin-stat-${c.k}`}>
              <div className={`${c.c} text-white h-9 w-9 grid place-items-center rounded-sm`}>
                <Icon className="h-4 w-4" />
              </div>
              <p className="mt-3 text-xs uppercase tracking-widest text-zinc-500 font-bold">{c.t}</p>
              <p className="font-display font-black text-4xl tracking-tighter mt-1">{c.v}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 grid lg:grid-cols-2 gap-6">
        <div className="bg-white border border-zinc-200 rounded-sm p-5">
          <h2 className="font-display font-black uppercase text-xl tracking-tight">Últimos leads</h2>
          {recent.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-500">Sin leads aún.</p>
          ) : (
            <ul className="mt-3 divide-y divide-zinc-100">
              {recent.map((l) => (
                <li key={l.id} className="py-3 flex flex-wrap gap-3 justify-between">
                  <div>
                    <p className="font-bold text-sm">{l.nombre}</p>
                    <p className="text-xs text-zinc-500">{l.telefono} {l.ciudad ? `· ${l.ciudad}` : ""} {l.modelo_tractor ? `· ${l.modelo_tractor}` : ""}</p>
                  </div>
                  <p className="text-xs text-zinc-500">{new Date(l.created_at).toLocaleString("es-CO")}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white border border-zinc-200 rounded-sm p-5">
          <h2 className="font-display font-black uppercase text-xl tracking-tight flex items-center gap-2">
            <Eye className="h-5 w-5 text-zetor-red" /> Artículos más visitados
          </h2>
          {topPosts.length === 0 ? (
            <p className="mt-3 text-sm text-zinc-500">Sin visitas aún.</p>
          ) : (
            <ul className="mt-3 divide-y divide-zinc-100">
              {topPosts.map((post, i) => (
                <li key={post.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-display font-black text-2xl text-zinc-200 w-6">{i + 1}</span>
                    <p className="font-bold text-sm">{post.titulo}</p>
                  </div>
                  <span className="text-xs font-bold text-zinc-500 whitespace-nowrap">
                    {post.views || 0} visitas
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
