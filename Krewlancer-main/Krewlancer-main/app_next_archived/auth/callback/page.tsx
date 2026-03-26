"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { useAuth } from "@/lib/auth-context"

export default function GoogleAuthCallbackPage() {
  const router = useRouter()
  const { refreshUser } = useAuth()

  useEffect(() => {
    let cancelled = false

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

    const finalizeLogin = async () => {
      // Retry a few times in case browser cookie/session propagation is slightly delayed.
      for (let attempt = 0; attempt < 3; attempt += 1) {
        const restoredUser = await refreshUser()
        if (cancelled) return

        if (restoredUser) {
          router.replace(restoredUser.role === "admin" ? "/admin" : "/")
          return
        }

        if (attempt < 2) {
          await sleep(300)
        }
      }

      router.replace("/login?error=google_auth_failed")
    }

    finalizeLogin()

    return () => {
      cancelled = true
    }
  }, [refreshUser, router])

  return (
    <div className="min-h-screen bg-[#030303] text-[#e8e8e3] flex items-center justify-center px-6">
      <div className="text-center border border-white/10 px-8 py-10">
        <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Google Sign-In</p>
        <h1 className="mt-3 text-xl tracking-[0.15em]">Finalizing your login...</h1>
        <p className="mt-3 text-sm text-gray-400">Please wait while we load your account.</p>
      </div>
    </div>
  )
}
