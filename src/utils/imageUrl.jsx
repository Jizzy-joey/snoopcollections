
export function getImageUrl(image) {
  if (!image) return "";

  // Leave external images and imported assets alone.
  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("data:") ||
    image.startsWith("blob:")
  ) {
    return image;
  }

  const base = import.meta.env.BASE_URL;

  // Avoid adding the GitHub Pages base twice.
  if (base !== "/" && image.startsWith(base)) {
    return image;
  }

  // Convert /shoes/shoe1.jpeg into the correct URL.
  const cleanPath = image.replace(/^\/+/, "");

  return `${base}${cleanPath}`;
}
