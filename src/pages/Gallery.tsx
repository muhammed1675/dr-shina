import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ExternalLink, Film, Mic, Newspaper, Radio, Tv } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { GalleryImage, MediaItem } from '../lib/types';
import { useSupabaseQuery } from '../lib/useSupabaseQuery';
import { useSiteSettings } from '../lib/SiteSettingsProvider';
import { HERO_IMAGES } from '../lib/heroImages';
import { formatDate } from '../lib/format';
import { PageHero } from '../components/site/PageHero';
import { SectionHeader } from '../components/site/SectionHeader';
import { MarqueeGallery } from '../components/site/Marquee';
import { Lightbox } from '../components/site/Lightbox';
import { Reveal } from '../components/site/Reveal';
import { EmptyState, ErrorState, Skeleton } from '../components/site/states';

const MEDIA_SECTIONS: {type: MediaItem['type'];label: string;Icon: typeof Film;}[] = [
{ type: 'video', label: 'Videos', Icon: Film },
{ type: 'podcast', label: 'Podcasts', Icon: Mic },
{ type: 'tv', label: 'TV Appearances', Icon: Tv },
{ type: 'interview', label: 'Interviews', Icon: Radio },
{ type: 'publication', label: 'Publications', Icon: Newspaper }];


export function Gallery() {
  const { hero } = useSiteSettings();
  const copy = hero('gallery_hero');
  const [album, setAlbum] = useState('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const gallery = useSupabaseQuery<GalleryImage>(
    () => supabase.from('gallery_images').select('*').order('display_order', { ascending: true }),
    []
  );

  const media = useSupabaseQuery<MediaItem>(
    () => supabase.from('media_items').select('*').order('item_date', { ascending: false, nullsFirst: false }),
    []
  );

  const albums = useMemo(
    () => ['All', ...Array.from(new Set(gallery.data.map((image) => image.album).filter(Boolean) as string[]))],
    [gallery.data]
  );

  const filtered = useMemo(
    () => album === 'All' ? gallery.data : gallery.data.filter((image) => image.album === album),
    [gallery.data, album]
  );

  return (
    <div className="w-full">
      <PageHero
        image={HERO_IMAGES.gallery}
        eyebrow="Gallery & Media"
        headline={copy.headline}
        subtitle={copy.subtitle}
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Gallery & Media' }]} />
      

      {/* Masonry gallery */}
      <section className="mx-auto max-w-content px-6 py-24 lg:px-10 lg:py-28">
        <SectionHeader eyebrow="Photography" title="The Gallery" />

        {gallery.loading ?
        <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
            {Array.from({ length: 9 }).map((_, index) =>
          <Skeleton key={index} className={`mb-5 w-full ${index % 3 === 0 ? 'h-72' : 'h-56'}`} />
          )}
          </div> :
        gallery.error ?
        <ErrorState message={gallery.error} onRetry={gallery.refetch} /> :
        gallery.data.length === 0 ?
        <EmptyState title="No images yet" description="Gallery images uploaded in the dashboard will appear here." /> :

        <>
            {albums.length > 1 &&
          <div className="mb-10 flex flex-wrap gap-2">
                {albums.map((item) =>
            <button
              key={item}
              type="button"
              onClick={() => setAlbum(item)}
              className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.12em] transition-colors ${
              album === item ? 'border-teal bg-teal text-white' : 'border-line bg-card text-subtle hover:border-teal hover:text-teal'}`
              }>
              
                    {item}
                  </button>
            )}
              </div>
          }

            <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
              <AnimatePresence mode="popLayout">
                {filtered.map((image, index) =>
              <motion.button
                key={image.id}
                layout
                type="button"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => setLightboxIndex(index)}
                className="group mb-5 block w-full overflow-hidden rounded-xl border border-line bg-card"
                aria-label={image.title ? `View ${image.title}` : 'View image'}>
                
                    <img
                  src={image.image_url}
                  alt={image.title ?? ''}
                  loading="lazy"
                  className="w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105" />
                
                  </motion.button>
              )}
              </AnimatePresence>
            </div>
          </>
        }
      </section>

      {/* Marquee strips */}
      {gallery.data.length > 0 &&
      <section className="border-y border-line bg-card py-20">
          <div className="mx-auto max-w-content px-6 lg:px-10">
            <SectionHeader eyebrow="In motion" title="A Continuous Reel" align="center" />
          </div>
          <MarqueeGallery
          images={gallery.data}
          onSelect={(image) => {
            const index = filtered.findIndex((item) => item.id === image.id);
            setLightboxIndex(index >= 0 ? index : null);
          }} />
        
        </section>
      }

      {/* Media */}
      <section className="mx-auto max-w-content px-6 py-24 lg:px-10 lg:py-28">
        <SectionHeader
          eyebrow="Media"
          title="Appearances & Publications"
          description="Conversations, broadcasts and writing published elsewhere." />
        

        {media.loading ?
        <div className="space-y-10">
            {[0, 1].map((row) =>
          <div key={row} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {[0, 1, 2, 3].map((item) =>
            <Skeleton key={item} className="h-56 w-full rounded-2xl" />
            )}
              </div>
          )}
          </div> :
        media.error ?
        <ErrorState message={media.error} onRetry={media.refetch} /> :
        media.data.length === 0 ?
        <EmptyState title="No media items yet" description="Videos, podcasts and press links will be listed here." /> :

        <div className="space-y-16">
            {MEDIA_SECTIONS.map(({ type, label, Icon }) => {
            const items = media.data.filter((item) => item.type === type);
            if (items.length === 0) return null;
            return (
              <Reveal key={type}>
                  <h3 className="mb-8 flex items-center gap-3 font-heading text-2xl text-ink">
                    <Icon className="h-5 w-5 text-teal" aria-hidden="true" />
                    {label}
                  </h3>
                  <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {items.map((item) =>
                  <li key={item.id}>
                        <a
                      href={item.external_url ?? '#'}
                      target={item.external_url ? '_blank' : undefined}
                      rel="noreferrer noopener"
                      className="group block h-full overflow-hidden rounded-2xl border border-line bg-card shadow-card transition-all duration-500 hover:-translate-y-1 hover:shadow-lift">
                      
                          <div className="aspect-[16/10] overflow-hidden bg-muted">
                            {item.thumbnail_url ?
                        <img
                          src={item.thumbnail_url}
                          alt=""
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-[900ms] group-hover:scale-105" /> :


                        <div className="flex h-full items-center justify-center text-subtle/40">
                                <Icon className="h-7 w-7" aria-hidden="true" />
                              </div>
                        }
                          </div>
                          <div className="p-5">
                            <p className="font-heading text-lg leading-snug text-ink transition-colors group-hover:text-teal-dark">
                              {item.title}
                            </p>
                            <p className="mt-3 flex items-center gap-2 text-xs text-subtle">
                              {formatDate(item.item_date, 'MMM d, yyyy')}
                              {item.external_url && <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />}
                            </p>
                          </div>
                        </a>
                      </li>
                  )}
                  </ul>
                </Reveal>);

          })}
          </div>
        }
      </section>

      <Lightbox
        images={filtered}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onIndexChange={setLightboxIndex} />
      
    </div>);

}