import React, { useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { GalleryImage } from '../../lib/types';

interface LightboxProps {
  images: GalleryImage[];
  index: number | null;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}

export function Lightbox({ images, index, onClose, onIndexChange }: LightboxProps) {
  const open = index !== null && images.length > 0;

  const step = useCallback(
    (delta: number) => {
      if (index === null) return;
      const next = (index + delta + images.length) % images.length;
      onIndexChange(next);
    },
    [index, images.length, onIndexChange]
  );

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight') step(1);
      if (event.key === 'ArrowLeft') step(-1);
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose, step]);

  const current = open ? images[index as number] : null;

  return (
    <AnimatePresence>
      {open && current &&
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={current.title ?? 'Gallery image'}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/95 p-4 sm:p-10"
        onClick={onClose}>
        
          <button
          type="button"
          onClick={onClose}
          aria-label="Close gallery"
          className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:border-teal hover:text-teal">
          
            <X className="h-5 w-5" />
          </button>

          <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            step(-1);
          }}
          aria-label="Previous image"
          className="absolute left-3 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:border-teal hover:text-teal sm:left-8">
          
            <ChevronLeft className="h-5 w-5" />
          </button>

          <motion.figure
          key={current.id}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="max-h-full w-full max-w-5xl"
          onClick={(event) => event.stopPropagation()}>
          
            <img
            src={current.image_url}
            alt={current.title ?? ''}
            className="mx-auto max-h-[76vh] w-auto rounded-xl object-contain" />
          
            <figcaption className="mt-5 text-center text-sm text-white/70">
              {current.title}
              {current.album && <span className="ml-2 text-white/40">· {current.album}</span>}
              <span className="ml-3 text-white/30">
                {(index as number) + 1} / {images.length}
              </span>
            </figcaption>
          </motion.figure>

          <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            step(1);
          }}
          aria-label="Next image"
          className="absolute right-3 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:border-teal hover:text-teal sm:right-8">
          
            <ChevronRight className="h-5 w-5" />
          </button>
        </motion.div>
      }
    </AnimatePresence>);

}