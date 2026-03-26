"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { Link } from "react-router-dom"
import Image from "@/src/components/app-image"
import gsap from "gsap"
import { Sparkles, Award } from "lucide-react"
import type { Product } from "@/lib/data"
import { resolveMediaUrl } from "@/lib/media-url"

type ProductCardProps = {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [currentImage, setCurrentImage] = useState(0)
  const rootRef = useRef<HTMLAnchorElement | null>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)

  // Robustly handle images which might be JSON strings or arrays
  const images = useMemo(() => {
    if (Array.isArray(product.images) && product.images.length > 0) return product.images
    try {
      const parsed = JSON.parse(product.images as unknown as string)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
      if (typeof parsed === "string" && parsed.trim()) return [parsed]
      return []
    } catch {
      const imageLike = (product as any).image
      const fromImages = typeof product.images === "string" && product.images.trim() ? [product.images] : []
      const fromImage = typeof imageLike === "string" && imageLike.trim() ? [imageLike] : []
      return [...fromImages, ...fromImage]
    }
  }, [product.images])

  const activeImage = images[currentImage] || (product as any).image || "/placeholder.jpg"

  const isInStock = (product as any).stock !== undefined ? (product as any).stock > 0 : product.inStock

  useEffect(() => {
    if (!rootRef.current) return
    const ctx = gsap.context(() => {
      gsap.from(rootRef.current, { y: 18, opacity: 0, duration: 0.8, ease: "power3.out" })
    }, rootRef)
    return () => ctx.revert()
  }, [])

  const handleHover = () => {
    if (!imgRef.current) return
    gsap.to(imgRef.current, { scale: 1.04, duration: 0.5, ease: "power2.out" })
    gsap.to(rootRef.current, { boxShadow: "0 10px 30px rgba(0,0,0,0.15)", duration: 0.35 })
  }

  const handleLeave = () => {
    if (!imgRef.current) return
    gsap.to(imgRef.current, { scale: 1, duration: 0.35, ease: "power2.out" })
    gsap.to(rootRef.current, { boxShadow: "0 0px 0px rgba(0,0,0,0)", duration: 0.35 })
  }

  return (
    <Link
      to={`/product/${product.id}`}
      ref={rootRef}
      className="group block rounded-sm focus:outline-none focus:ring-2 focus:ring-white/20"
      onMouseEnter={handleHover}
      onMouseLeave={handleLeave}
    >
      {/* Image Container */}
      <div className="relative aspect-3/4 overflow-hidden bg-[#111] rounded-sm">
        <Image
          src={resolveMediaUrl(activeImage)}
          alt={product.name}
          fill
          ref={imgRef as any}
          className="object-contain p-2 transition-opacity duration-300"
          loading="lazy"
          decoding="async"
        />

        {/* Out of stock overlay */}
        {!isInStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-xs uppercase tracking-widest border border-white/40 px-3 py-1.5 text-white/80">
              Out of Stock
            </span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {(product.newArrival || (product as any).is_new) && (
            <span className="bg-white text-black text-[9px] uppercase tracking-widest px-2 py-0.5 font-medium flex items-center gap-1">
              <Sparkles size={8} />
              New
            </span>
          )}
          {(product.bestseller || (product as any).is_bestseller) && (
            <span className="bg-amber-500 text-black text-[9px] uppercase tracking-widest px-2 py-0.5 font-medium flex items-center gap-1">
              <Award size={8} />
              Best
            </span>
          )}
        </div>

        {/* CTA */}
        <div className="absolute inset-x-0 bottom-0 translate-y-0 transition-transform duration-300 bg-black/80 backdrop-blur-sm py-3 text-center">
          <span className="text-xs uppercase tracking-widest text-white">View Details</span>
        </div>
      </div>

      {/* Text info */}
      <div className="mt-3 space-y-0.5">
        <p className="text-[10px] uppercase tracking-widest text-gray-500">{product.category}</p>
        <h3 className="text-sm font-medium text-balance group-hover:text-gray-300 transition-colors leading-snug">
          {product.name}
        </h3>
        <p className="text-sm text-gray-400">₹{product.price.toLocaleString('en-IN')}</p>
      </div>
    </Link>
  )
}
