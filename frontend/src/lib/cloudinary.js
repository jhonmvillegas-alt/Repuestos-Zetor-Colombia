export function withSmartCrop(url, size = 800) {
  if (!url || !url.includes("res.cloudinary.com") || !url.includes("/upload/")) return url;
  if (url.includes("/upload/c_fill")) return url;
  return url.replace("/upload/", `/upload/c_fill,g_auto,w_${size},h_${size}/`);
}
