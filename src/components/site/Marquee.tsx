import React, { useMemo } from 'react';
import { GalleryImage } from '../../lib/types';

interface MarqueeRowProps {
  images: GalleryImage[];
  direction?: 'left' | 'right';
  duration?: number;
  onSelect?: (image: GalleryImage) => void;
}

export function MarqueeRow({ images, direction = 'left', duration = 60, onSelect }: MarqueeRowProps) {
  const loop = useMemo(() => [...images, ...images], [images]);
  if (images.length === 0) return null;

  return (
    <div className="marquee-viewport w-full overflow-hidden">
      <div
        className={`marquee-track gap-5 ${direction === 'left' ? 'marquee-left' : 'marquee-right'}`}
        style={{ ['--marquee-duration' as string]: `${duration}s` }}>
        
        {loop.map((image, index) =>
        <button
          key={`${image.id}-${index}`}
          type="button"
          onClick={() => onSelect?.(image)}
          aria-label={image.title ? `View ${image.title}` : 'View image'}
          className="group relative h-40 w-64 shrink-0 overflow-hidden rounded-xl border border-line/60 bg-card sm:h-48 sm:w-80">
          
            <img
            src={image.image_url}
            alt={image.title ?? ''}
            loading="lazy"
            className="h-full w-full scale-[1.03] object-cover transition-transform duration-700 group-hover:scale-110" />
          
            <span className="absolute inset-0 bg-ink/0 transition-colors duration-500 group-hover:bg-ink/20" />
          </button>
        )}
      </div>
    </div>);

}

interface MarqueeGalleryProps {
  images: GalleryImage[];
  onSelect?: (image: GalleryImage) => void;
  rows?: number;
}

/** Three-row infinite marquee: rows alternate direction and speed. */
export function MarqueeGallery({ images, onSelect, rows = 3 }: MarqueeGalleryProps) {
  const buckets = useMemo(() => {
    const result: GalleryImage[][] = Array.from({ length: rows }, () => []);
    images.forEach((image, index) => {
      result[index % rows].push(image);
    });
    // A row needs a few items to loop convincingly — top up from the full set.
    return result.map((bucket) => bucket.length >= 4 ? bucket : [...bucket, ...images].slice(0, Math.max(4, images.length)));
  }, [images, rows]);

  const configs = [
  { direction: 'left' as const, duration: 70 },
  { direction: 'right' as const, duration: 90 },
  { direction: 'left' as const, duration: 55 }];


  return (
    <div className="space-y-5">
      {buckets.map((bucket, index) =>
      <MarqueeRow
        key={index}
        images={bucket}
        direction={configs[index % configs.length].direction}
        duration={configs[index % configs.length].duration}
        onSelect={onSelect} />

      )}
    </div>);

}