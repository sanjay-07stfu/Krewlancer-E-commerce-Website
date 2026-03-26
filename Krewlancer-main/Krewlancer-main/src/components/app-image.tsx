import type React from "react"
import { forwardRef, useEffect, useState } from "react"

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  fill?: boolean
  priority?: boolean
}

const Image = forwardRef<HTMLImageElement, Props>(function Image(
  { fill, style, className, alt, src, ...rest },
  ref,
) {
  const [currentSrc, setCurrentSrc] = useState<string>(typeof src === "string" ? src : "")

  useEffect(() => {
    setCurrentSrc(typeof src === "string" ? src : "")
  }, [src])

  const mergedStyle = fill
    ? { position: "absolute", inset: 0, width: "100%", height: "100%", ...(style || {}) }
    : style

  return (
    <img
      ref={ref}
      src={currentSrc || "/placeholder.jpg"}
      alt={alt || ""}
      className={className}
      style={mergedStyle as React.CSSProperties}
      onError={() => {
        if (currentSrc !== "/placeholder.jpg") {
          setCurrentSrc("/placeholder.jpg")
        }
      }}
      {...rest}
    />
  )
})

export default Image
