import { useState, useEffect } from 'react';

const PLACEHOLDER = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><rect fill="#0a0a0f" width="96" height="96" rx="12"/><text x="48" y="52" text-anchor="middle" fill="#4b5563" font-size="11">Loading</text></svg>',
);

/** AI WebP thumbnails only — never falls back to legacy SVG art */
export default function ItemImage({ src, alt, className = 'item-img', size = 'card', eager = false }) {
  const sizeClass = size === 'list' ? 'item-img-sm' : size === 'hero' ? 'item-img-lg' : size === 'banner' ? 'item-img-banner' : 'item-img';
  const [imgSrc, setImgSrc] = useState(src || PLACEHOLDER);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
    setImgSrc(src || PLACEHOLDER);
  }, [src]);

  return (
    <img
      src={failed ? PLACEHOLDER : imgSrc}
      alt={alt || ''}
      className={`${sizeClass}${className !== 'item-img' ? ` ${className}` : ''}${failed ? ' opacity-60' : ''}`}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={eager ? 'high' : 'auto'}
      width={size === 'banner' ? 56 : size === 'list' ? 80 : size === 'hero' ? 160 : 96}
      height={size === 'banner' ? 56 : size === 'list' ? 80 : size === 'hero' ? 160 : 96}
      onError={() => setFailed(true)}
    />
  );
}
