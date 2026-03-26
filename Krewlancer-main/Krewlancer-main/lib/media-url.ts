import { getApiBase } from "@/lib/api-base"

const API_BASE = getApiBase()

function withUploadsPath(url: string): string {
  return url.replace("/static/uploads/", "/uploads/")
}

function sanitizeMediaValue(raw: string): string {
  let value = raw.trim()
  if (!value) return ""

  // Decode common encoded quote artifacts from malformed JSON strings.
  value = value.replace(/%22/gi, '"').replace(/%27/gi, "'")

  // If a comma-separated list leaked into a single field, keep the first candidate.
  if (value.includes(",") && !value.startsWith("http://") && !value.startsWith("https://")) {
    value = value.split(",")[0] || value
  }

  value = value.trim()
  value = value.replace(/^\[+/, "").replace(/\]+$/, "")
  value = value.replace(/^['"]+/, "").replace(/['"]+$/, "")

  // Keep only up to image extension when malformed suffixes leak from serialized arrays.
  const extMatch = value.match(/\.(png|jpe?g|webp|gif|avif|svg)(\?.*)?$/i)
  if (!extMatch) {
    const cutoffMatch = value.match(/^(.*?\.(png|jpe?g|webp|gif|avif|svg))/i)
    if (cutoffMatch?.[1]) {
      value = cutoffMatch[1]
    }
  }

  // Decode URI-escaped values when possible.
  try {
    value = decodeURIComponent(value)
  } catch {
    // Keep original value when decode fails.
  }

  return value.trim()
}

function looksLikeBareUploadFilename(value: string): boolean {
  if (!value) return false
  if (value.includes("/")) return false
  return /\.(png|jpe?g|webp|gif|avif|svg)$/i.test(value)
}

export function resolveMediaUrl(url?: string | null): string {
  if (!url) return "/placeholder.jpg"

  const trimmed = sanitizeMediaValue(url)
  if (!trimmed) return "/placeholder.jpg"

  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:")
  ) {
    try {
      const parsed = new URL(trimmed)
      if (parsed.pathname.startsWith("/static/uploads/") || parsed.pathname.startsWith("/uploads/")) {
        parsed.pathname = withUploadsPath(parsed.pathname)
        return parsed.toString()
      }
    } catch {
      return trimmed
    }
    return trimmed
  }

  if (trimmed.startsWith("/uploads/")) {
    return `${API_BASE}${trimmed}`
  }

  if (trimmed.startsWith("/static/uploads/")) {
    return `${API_BASE}${withUploadsPath(trimmed)}`
  }

  if (trimmed.startsWith("uploads/")) {
    return `${API_BASE}/${trimmed}`
  }

  if (trimmed.startsWith("static/uploads/")) {
    return `${API_BASE}/${withUploadsPath(`/${trimmed}`)}`
  }

  if (trimmed.startsWith("/")) {
    return trimmed
  }

  if (looksLikeBareUploadFilename(trimmed)) {
    return `${API_BASE}/uploads/${trimmed}`
  }

  return `/${trimmed}`
}