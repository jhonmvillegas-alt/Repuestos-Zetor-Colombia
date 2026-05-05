import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Filter, Search, X } from "lucide-react";
import api from "../lib/api";
import ProductCard from "../components/ProductCard";

const SYSTEMS = [
  { slug: "motor", label: "Motor" },
  { slug: "hidraulico", label: "Hidráulico" },
  { slug: "transmision", label: "Transmisión" },
  { slug: "frenos", label: "Frenos" },
  { slug: "filtros", label: "Filtros" },
];
const MODELS = ["5511-5545", "5711-5745", "6711-6745", "6911-6945", "7011-7045", "7211-7245", "8011-12045"];

export default function Catalogo() {
  const [params, setParams] = useSearchParams();
  const sistema = params.get("sistema") || "";
  const modelo = params.get("modelo") || "";
  const q = params.get("q") || "";
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState(q);

  const fetchItems = async () => {
    setLoading(true);
    const qs = new URLSearchParams();
    if (sistema) qs.set("sistema", sistema);
    if (modelo) qs.set("modelo", modelo);
    if (q) qs.set("q", q);
    qs.set("limit", "60");
    const { data } = await api.get(`/products?${qs.toString()}`);
    setItems(data.items || []);
    setTotal(data.total || 0);
    setLoading(false);
  };
  useEffect(() => { fetchItems(); }, [sistema, modelo, q]);

  const update = (key, value) => {
    const np = new URLSearchParams(params);
    if (value) np.set(key, value); else np.delete(key);
    setParams(np);
  };

  const onSearch = (e) => { e.preventDefault(); update("q", searchInput.trim()); };

  return (
    <div className="bg-white" data-testid="catalogo-page">
      <div className="bg-carbon text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:py-20">
          <p className="text-zetor-red text-xs uppercase tracking-[0.3em] font-bold">Catálogo técnico</p>
          <h1 className="mt-2 font-display font-black uppercase text-4xl sm:text-5xl lg:text-6xl tracking-tighter">
            Todos los <span className="text-zetor-red">repuestos</span>
          </h1>
          <p className="mt-3 text-zinc-300 max-w-2xl">
            {total} referencias activas. Filtra por sistema o modelo. Validamos compatibilidad antes de despachar.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 grid lg:grid-cols-12 gap-8">
        <aside className="lg:col-span-3" data-testid="catalogo-filters">
          <div className="lg:sticky lg:top-32">
            <form onSubmit={onSearch} className="flex items-center bg-zinc-100 border border-zinc-200 px-3 py-2.5 rounded-sm mb-6">
              <Search className="h-4 w-4 text-zinc-500" />
              <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Buscar SKU o nombre..." className="bg-transparent outline-none text-sm w-full ml-2" data-testid="catalogo-search-input" />
              {searchInput && (
                <button type="button" onClick={() => { setSearchInput(""); update("q", ""); }}><X className="h-4 w-4 text-zinc-500" /></button>
              )}
            </form>

            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-zetor-red mb-3 flex items-center gap-2">
                <Filter className="h-3.5 w-3.5" /> Sistema
              </h3>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => update("sistema", "")}
                  className={`text-left px-3 py-2 text-sm font-semibold uppercase tracking-wider rounded-sm border ${!sistema ? "bg-carbon text-white border-carbon" : "border-zinc-200 hover:border-carbon"}`}
                  data-testid="filter-sistema-all"
                >
                  Todos
                </button>
                {SYSTEMS.map((s) => (
                  <button
                    key={s.slug}
                    onClick={() => update("sistema", s.slug)}
                    className={`text-left px-3 py-2 text-sm font-semibold uppercase tracking-wider rounded-sm border ${sistema === s.slug ? "bg-zetor-red text-white border-zetor-red" : "border-zinc-200 hover:border-carbon"}`}
                    data-testid={`filter-sistema-${s.slug}`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-zetor-red mb-3">Modelo Zetor</h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => update("modelo", "")}
                  className={`px-3 py-2 text-xs font-bold rounded-sm border ${!modelo ? "bg-carbon text-white border-carbon" : "border-zinc-200 hover:border-carbon"}`}
                  data-testid="filter-modelo-all"
                >Todos</button>
                {MODELS.map((m) => (
                  <button
                    key={m}
                    onClick={() => update("modelo", m)}
                    className={`px-2 py-2 text-[11px] font-bold rounded-sm border whitespace-nowrap ${modelo === m ? "bg-zetor-red text-white border-zetor-red" : "border-zinc-200 hover:border-carbon"}`}
                    data-testid={`filter-modelo-${m}`}
                  >{m}</button>
                ))}
              </div>
            </div>

            <Link to="/asesoria" className="block bg-zetor-red text-white p-5 rounded-sm" data-testid="filter-advisory-cta">
              <p className="text-xs uppercase tracking-widest font-bold opacity-90">¿No encuentras tu repuesto?</p>
              <p className="font-display font-black text-xl uppercase mt-1 tracking-tight">Consulta con un experto</p>
            </Link>
          </div>
        </aside>

        <main className="lg:col-span-9">
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm text-zinc-600">
              {loading ? "Cargando..." : <><strong>{items.length}</strong> resultados</>}
              {sistema && <> · sistema: <strong className="text-carbon">{SYSTEMS.find(s => s.slug === sistema)?.label}</strong></>}
              {modelo && <> · modelo: <strong className="text-carbon">Zetor {modelo}</strong></>}
              {q && <> · búsqueda: "<strong>{q}</strong>"</>}
            </p>
          </div>
          {items.length === 0 && !loading ? (
            <div className="border border-dashed border-zinc-300 p-10 text-center rounded-sm">
              <p className="font-display font-black text-2xl uppercase">Sin resultados</p>
              <p className="mt-2 text-zinc-600 text-sm">Intenta con otra búsqueda o consulta directamente con un asesor.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {items.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
