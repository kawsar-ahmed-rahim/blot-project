import { useState } from 'react'

// Shows a quiet placeholder when there is no image or it fails to load
export default function CoverImage({ src, alt = '', className = '' }) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return <div className={`bg-base-300 ${className}`} role="img" aria-label={alt || 'No cover image'} />
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  )
}
