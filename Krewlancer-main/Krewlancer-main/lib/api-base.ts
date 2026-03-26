function normalizeApiBase(raw: string): string {
  const value = raw.trim().replace(/\/+$/, "")
  if (!value) return value

  // Avoid mixed content in production (HTTPS page cannot call HTTP API).
  if (value.startsWith("http://") && !value.includes("localhost") && !value.includes("127.0.0.1")) {
    return `https://${value.slice("http://".length)}`
  }
  return value
}

export function hasExplicitApiBase(): boolean {
  return !!import.meta.env.VITE_API_BASE?.trim()
}

export function getApiBase(): string {
  const envBase = import.meta.env.VITE_API_BASE
  if (envBase) return normalizeApiBase(envBase)

  if (typeof window !== "undefined") {
    const host = window.location.hostname
    const isLocalHost = host === "localhost" || host === "127.0.0.1"

    if (isLocalHost) {
      return `http://${host}:5004`
    }

    // In hosted frontend environments without env vars, prefer same-origin.
    // This avoids pinning to stale hardcoded backend domains.
    return normalizeApiBase(window.location.origin)
  }

  return "http://localhost:5004"
}

