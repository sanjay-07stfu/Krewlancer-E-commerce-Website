import type React from "react"
import { LenisProvider } from "@/components/lenis-provider"
import { WishlistProvider } from "@/lib/wishlist-context"
import { CartProvider } from "@/lib/cart-context"
import { AuthProvider } from "@/lib/auth-context"
import { ToastProvider } from "@/lib/toast-context"

export function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
          <ToastProvider>
            <LenisProvider>{children}</LenisProvider>
          </ToastProvider>
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  )
}
