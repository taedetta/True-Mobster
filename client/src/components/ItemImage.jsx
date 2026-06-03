import { useState, useEffect } from 'react';

const PLACEHOLDER = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"><rect fill="#14141c" width="96" height="96" rx="12"/><text x="48" y="54" text-anchor="middle" fill="#666" font-size="28">?</text></svg>',
);

/** Optimized item thumbnail with webp → svg fallback */
export default function ItemImage({ src, alt, className = 'item-img', size = 'card', eager = false }) {
  const sizeClass = size === 'list' ? 'item-img-sm' : size === 'hero' ? 'item-img-lg' : 'item-img';
  const [imgSrc, setImgSrc] = useState(src || PLACEHOLDER);

  useEffect(() => {
    setImgSrc(src || PLACEHOLDER);
  }, [src]);

  const onError = (e) => {
    const url = e.currentTarget.src;
    if (url.includes('.webp')) {
      setImgSrc(url.replace(/\.webp(\?.*)?$/, '.svg'));
      return;
    }
    if (!url.startsWith('data:')) setImgSrc(PLACEHOLDER);
  };

  return (
    <img
      src={imgSrc}
      alt={alt || ''}
      className={`${sizeClass}${className !== 'item-img' ? ` ${className}` : ''}`}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={eager ? 'high' : 'auto'}
      width={size === 'list' ? 80 : size === 'hero' ? 160 : 96}
      height={size === 'list' ? 80 : size === 'hero' ? 160 : 96}
      onError={onError}
    />
  );
}
