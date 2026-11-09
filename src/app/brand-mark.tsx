/**
 * Brand mark for generated images (apple-icon, opengraph-image).
 * Mirrors src/app/icon.svg; ImageResponse can't load that file directly.
 */
export function BrandMark({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#60a5fa" />
          <stop offset="1" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="17" fill="none" stroke="url(#g)" strokeWidth="5" />
      <circle cx="32" cy="32" r="6" fill="url(#g)" />
    </svg>
  )
}
