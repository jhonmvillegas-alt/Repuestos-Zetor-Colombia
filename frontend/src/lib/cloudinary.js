export function withSmartCrop(url, size = 800) {
  if (!url || !url.includes("res.cloudinary.com") || !url.includes("/upload/")) return url;
  if (url.includes("/upload/c_pad")) return url;
  return url.replace("/upload/", `/upload/c_pad,b_white,w_${size},h_${size}/`);
}
