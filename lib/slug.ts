export function slugify(input: string) {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

export function safeText(input: unknown, fallback = "") {
  if (typeof input !== "string") return fallback;
  return input.trim() || fallback;
}
