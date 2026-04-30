import React from "react";
import { Link } from "react-router-dom";
import { MessageCircle, ChevronRight } from "lucide-react";
import { productWhatsAppMessage } from "../lib/whatsapp";

export default function ProductCard({ product }) {
  if (!product) return null;
  const sysLabels = {
    motor: "Motor",
    hidraulico: "Hidráulico",
    transmision: "Transmisión",
    frenos: "Frenos",
    filtros: "Filtros",
  };
  return (
    <article className="industrial-card flex flex-col rounded-sm overflow-hidden" data-testid={`product-card-${product.sku}`}>
      <Link to={`/producto/${product.slug}`} className="relative block aspect-square bg-zinc-100 overflow-hidden group">
        {product.imagen_principal ? (
          <img
            src={product.imagen_principal}
            alt={product.nombre}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full grid place-items-center text-zinc-400 text-xs uppercase">
            Sin imagen
          </div>
        )}
        <span className="absolute top-2 left-2 bg-carbon text-white text-[10px] uppercase tracking-widest px-2 py-1 font-bold">
          {sysLabels[product.sistema] || product.sistema}
        </span>
        {product.destacado && (
          <span className="absolute top-2 right-2 bg-zetor-red text-white text-[10px] uppercase tracking-widest px-2 py-1 font-bold">
            Destacado
          </span>
        )}
      </Link>
      <div className="p-4 flex flex-col flex-1">
        <p className="text-[11px] uppercase tracking-widest text-zinc-500 font-bold">SKU · {product.sku}</p>
        <h3 className="mt-1 font-display font-black text-base leading-tight uppercase tracking-tight text-carbon line-clamp-2">
          {product.nombre}
        </h3>
        <div className="mt-3 flex flex-wrap gap-1">
          {(product.compatibilidad || []).slice(0, 4).map((m) => (
            <span key={m} className="text-[10px] font-bold border border-zinc-300 px-1.5 py-0.5 uppercase tracking-wider text-zinc-700">
              Z{m}
            </span>
          ))}
        </div>
        <div className="mt-4 flex-1" />
        <div className="grid grid-cols-2 gap-2">
          <Link
            to={`/producto/${product.slug}`}
            className="inline-flex items-center justify-center gap-1 border border-carbon text-carbon font-bold uppercase text-[11px] tracking-widest py-2 hover:bg-carbon hover:text-white transition"
            data-testid={`product-detail-${product.sku}`}
          >
            Ver ficha <ChevronRight className="h-3.5 w-3.5" />
          </Link>
          <a
            href={productWhatsAppMessage(product)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1 bg-whatsapp text-white font-bold uppercase text-[11px] tracking-widest py-2 hover:bg-[#1EBE5A]"
            data-testid={`product-whatsapp-${product.sku}`}
          >
            <MessageCircle className="h-3.5 w-3.5" /> Cotizar
          </a>
        </div>
      </div>
    </article>
  );
}
