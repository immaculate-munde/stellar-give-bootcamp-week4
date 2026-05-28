const DIRECT_IMAGE_PATTERN =
  /\.(png|jpe?g|webp|gif|avif|svg)(\?.*)?$/i;

const BLOCKED_HOSTS = [
  "share.google",
  "photos.google.com",
  "drive.google.com",
  "docs.google.com",
  "goo.gl",
];

export function normalizeImageUrl(url: string): string {
  return url.trim();
}

export function validateImageUrl(url: string): string | null {
  const trimmed = normalizeImageUrl(url);
  if (!trimmed) {
    return "Please upload an image or paste a direct image URL";
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return "Enter a valid URL starting with https://";
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return "Image URL must use http:// or https://";
  }

  const host = parsed.hostname.replace(/^www\./, "");
  if (BLOCKED_HOSTS.some((blocked) => host === blocked || host.endsWith(`.${blocked}`))) {
    return "Google share links do not work. Right-click the image, choose “Copy image address”, and paste that URL instead.";
  }

  if (!DIRECT_IMAGE_PATTERN.test(parsed.pathname)) {
    return "Use a direct image link (URL ending in .jpg, .png, .webp, etc.) from Imgur, Unsplash, or similar.";
  }

  return null;
}
