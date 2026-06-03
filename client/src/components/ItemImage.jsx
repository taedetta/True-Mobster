/** Optimized item thumbnail with webp → svg fallback */
export default function ItemImage({ src, alt, className = 'item-img', size = 'card' }) {
  const sizeClass = size === 'list' ? 'item-img-sm' : size === 'hero' ? 'item-img-lg' : 'item-img';

  const fallback = (el) => {
    const url = el.currentTarget.src;
    if (url.endsWith('.webp') || url.includes('.webp?')) {
      el.currentTarget.src = url.replace(/\.webp(\?.*)?$/, '.svg');
    }
  };

  return (
    <img
      src={src}
      alt={alt}
      className={`${sizeClass}${className !== 'item-img' ? ` ${className}` : ''}`}
      loading="lazy"
      decoding="async"
      width={size === 'list' ? 80 : size === 'hero' ? 160 : 96}
      height={size === 'list' ? 80 : size === 'hero' ? 160 : 96}
      onError={fallback}
    />
  );
}
