// Build a WhatsApp deep link with prefilled message.
// The number is fetched at runtime from /api/site/config (env-driven).
let _whatsappNumber = "573202453457"; // safe fallback while config loads

export const setWhatsAppNumber = (n) => {
  if (!n) return;
  _whatsappNumber = String(n).replace(/\D/g, "");
};

export const getWhatsAppNumber = () => _whatsappNumber;

export const formatWhatsAppDisplay = (n) => {
  const clean = String(n || _whatsappNumber).replace(/\D/g, "");
  if (clean.length === 12 && clean.startsWith("57")) {
    return `+57 ${clean.slice(2, 5)} ${clean.slice(5, 8)} ${clean.slice(8)}`;
  }
  return `+${clean}`;
};

export const buildWhatsAppUrl = (message) => {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${_whatsappNumber}?text=${encoded}`;
};

export const productWhatsAppMessage = (product, extras = {}) => {
  const url = typeof window !== "undefined"
    ? `${window.location.origin}/producto/${product.slug}`
    : product.slug;
  const lines = [
    "Hola, quiero validar la compatibilidad de este repuesto Zetor:",
    "",
    `• Producto: ${product.nombre}`,
    `• SKU/Referencia: ${product.sku}`,
    `• Sistema: ${product.sistema}`,
    `• Enlace: ${url}`,
    "",
    `Mi modelo de tractor: ${extras.modelo || "(indicar modelo Zetor)"}`,
    `Ciudad: ${extras.ciudad || "(indicar ciudad)"}`,
    "",
    "¿Pueden confirmar disponibilidad y validar compatibilidad antes de cotizar? Gracias.",
  ];
  return buildWhatsAppUrl(lines.join("\n"));
};

export const generalWhatsAppMessage = (note = "") => {
  const lines = [
    "Hola, estoy interesado en repuestos Zetor.",
    note ? `\n${note}` : "",
    "\n¿Pueden ayudarme con asesoría técnica?",
  ];
  return buildWhatsAppUrl(lines.join(""));
};

export const modelWhatsAppMessage = (modelo) => {
  const url = typeof window !== "undefined" ? `${window.location.origin}/modelo/${modelo}` : "";
  const lines = [
    `Hola, busco repuestos para mi tractor Zetor ${modelo}.`,
    `Enlace: ${url}`,
    "",
    "¿Pueden ayudarme con asesoría técnica y validación de compatibilidad?",
  ];
  return buildWhatsAppUrl(lines.join("\n"));
};
