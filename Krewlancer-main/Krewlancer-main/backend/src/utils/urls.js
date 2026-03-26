import { env } from "../config/env.js";

export function publicAssetUrl(value) {
  if (value == null) return value;
  const raw = String(value).trim();
  if (!raw) return raw;
  if (/^(https?:|data:|blob:)/i.test(raw)) return raw;
  const normalized = raw.startsWith("/") ? raw : `/${raw}`;
  const base = (env.backendUrl || "").replace(/\/+$/, "");
  return base ? `${base}${normalized}` : normalized;
}
