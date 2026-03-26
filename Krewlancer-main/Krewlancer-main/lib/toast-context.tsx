"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"
import { CheckCircle, Heart, X } from "lucide-react"

type ToastType = "cart" | "wishlist" | "info"

type Toast = {
    id: string
    message: string
    subtext?: string
    type: ToastType
}

type ToastContextType = {
    showToast: (message: string, type?: ToastType, subtext?: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])

    const showToast = useCallback((message: string, type: ToastType = "cart", subtext?: string) => {
        const id = Date.now().toString()
        setToasts((prev) => [...prev, { id, message, type, subtext }])
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id))
        }, 2800)
    }, [])

    const dismiss = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id))

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}

            {/* Toast portal - fixed bottom-right */}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className="pointer-events-auto flex items-start gap-3 bg-[#111] border border-white/10 px-4 py-3 shadow-2xl min-w-[260px] max-w-[320px] animate-[slideInRight_0.35s_ease-out]"
                        style={{ animation: "slideInRight 0.35s ease-out" }}
                    >
                        <div className="mt-0.5 shrink-0">
                            {toast.type === "wishlist" ? (
                                <Heart size={15} className="text-red-400 fill-red-400" />
                            ) : (
                                <CheckCircle size={15} className="text-white/70" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs uppercase tracking-widest text-white leading-snug">{toast.message}</p>
                            {toast.subtext && (
                                <p className="text-[10px] text-gray-500 mt-0.5 truncate">{toast.subtext}</p>
                            )}
                        </div>
                        <button
                            onClick={() => dismiss(toast.id)}
                            className="text-gray-600 hover:text-white transition-colors shrink-0 mt-0.5"
                        >
                            <X size={12} />
                        </button>
                    </div>
                ))}
            </div>

            <style>{`
        @keyframes slideInRight {
          from { transform: translateX(110%); opacity: 0; }
          to   { transform: translateX(0);   opacity: 1; }
        }
      `}</style>
        </ToastContext.Provider>
    )
}

export function useToast() {
    const ctx = useContext(ToastContext)
    if (!ctx) throw new Error("useToast must be used within ToastProvider")
    return ctx
}
