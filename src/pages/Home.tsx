import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowDown, ArrowRight, Images, Newspaper } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Article, GalleryImage, Project, SpeakingEvent, Testimonial } from '../lib/types';
import { useSupabaseQuery } from '../lib/useSupabaseQuery';
import { usePublicStats } from '../lib/useStats';
import { useSiteSettings } from '../lib/SiteSettingsProvider';
import { HERO_IMAGES, PORTRAIT_IMAGE } from '../lib/heroImages';
import { Reveal, Stagger, StaggerItem } from '../components/site/Reveal';
import { SectionHeader } from '../components/site/SectionHeader';
import { ArticleCard } from '../components/site/ArticleCard';
import { ProjectCard } from '../components/site/ProjectCard';
import { EventCard } from '../components/site/EventCard';
import { TestimonialStack } from '../components/site/Testimonials';
import { MarqueeGallery } from '../components/site/Marquee';
import { Lightbox } from '../components/site/Lightbox';
import { CountUp } from '../components/site/CountUp';
import { CardSkeletonGrid, EmptyState, ErrorState, Skeleton } from '../components/site/states';

export function Home() {
  const { hero } = useSiteSettings();
  const homeHero = hero('home_hero');
  const { stats } = usePublicStats();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const articles = useSupabaseQuery<Article>(
    () =>
    supabase.
    from('articles').
    select('*').
    eq('status', 'published').
    order('published_at', { ascending: false, nullsFirst: false }).
    limit(3),
    []
  );

  const gallery = useSupabaseQuery<GalleryImage>(
    () => supabase.from('gallery_images').select('*').order('display_order', { ascending: true }).limit(24),
    []
  );

  const projects = useSupabaseQuery<Project>(
    () => supabase.from('projects').select('*').order('created_at', { ascending: false }).limit(2),
    []
  );

  const events = useSupabaseQuery<SpeakingEvent>(
    () =>
    supabase.
    from('speaking_events').
    select('*').
    eq('status', 'upcoming').
    order('event_date', { ascending: true }).
    limit(3),
    []
  );

  const testimonials = useSupabaseQuery<Testimonial>(
    () => supabase.from('testimonials').select('*').order('display_order', { ascending: true }).limit(3),
    []
  );

  const statCards = [
  { label: 'Articles Published', value: stats.articles },
  { label: 'Speaking Events', value: stats.events },
  { label: 'Community Projects', value: stats.projects },
  { label: 'Lives Impacted', value: stats.livesImpacted }];


  return (
    <div className="w-full">
      {/* Hero */}
      <section className="relative flex min-h-[92vh] w-full items-center overflow-hidden bg-ink">
        <div className="absolute inset-0">
          <img src={HERO_IMAGES.home} alt="" aria-hidden="true" className="h-full w-full object-cover animate-kenburns" />
          <div className="absolute inset-0 bg-ink/55" />
          <div className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-ink/80 via-ink/40 to-transparent" />
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.13, delayChildren: 0.2 } } }}
          className="relative mx-auto w-full max-w-content px-6 pt-28 pb-32 lg:px-10">
          
          {[
          <p key="eyebrow" className="text-xs uppercase tracking-[0.3em] text-teal">
              Medical Doctor · Speaker · Health Advocate
            </p>,
          <h1 key="headline" className="mt-6 max-w-4xl font-heading text-4xl leading-[1.06] text-white sm:text-6xl lg:text-7xl">
              {homeHero.headline}
            </h1>,
          <p key="sub" className="mt-7 max-w-2xl text-lg leading-relaxed text-white/80">
              {homeHero.subtitle}
            </p>,
          <div key="cta" className="mt-10 flex flex-wrap gap-4">
              <Link
              to="/articles"
              className="inline-flex items-center gap-2 rounded-full bg-teal px-7 py-3.5 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-teal-dark">
              
                <Newspaper className="h-4 w-4" aria-hidden="true" />
                Read Articles
              </Link>
              <Link
              to="/gallery"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-7 py-3.5 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:border-white hover:bg-white/10">
              
                <Images className="h-4 w-4" aria-hidden="true" />
                View Gallery
              </Link>
            </div>].
          map((child, index) =>
          <motion.div
            key={index}
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } }
            }}>
            
              {child}
            </motion.div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2">
          
          <motion.span
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            className="flex flex-col items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/60">
            
            Scroll
            <ArrowDown className="h-4 w-4" aria-hidden="true" />
          </motion.span>
        </motion.div>
      </section>

      {/* Stats */}
      <section aria-label="Impact at a glance" className="border-b border-line bg-card">
        <div className="mx-auto grid max-w-content grid-cols-2 gap-y-10 px-6 py-16 lg:grid-cols-4 lg:px-10">
          {statCards.map((stat, index) =>
          <Reveal key={stat.label} delay={index * 0.08} className="text-center lg:text-left">
              <p className="font-heading text-4xl text-ink lg:text-5xl">
                <CountUp value={stat.value} suffix={stat.value > 0 ? '+' : ''} />
              </p>
              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-subtle">{stat.label}</p>
            </Reveal>
          )}
        </div>
      </section>

      {/* About preview */}
      <section className="mx-auto max-w-content px-6 py-24 lg:px-10 lg:py-32">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <Reveal direction="left">
            <div className="overflow-hidden rounded-2xl border border-line bg-card">
              <img src={PORTRAIT_IMAGE} alt="Portrait of Dr. Oladeji in his study" className="aspect-[4/5] w-full object-cover" />
            </div>
          </Reveal>
          <Reveal direction="right" delay={0.1}>
            <p className="text-xs uppercase tracking-[0.28em] text-teal">About</p>
            <h2 className="mt-4 font-heading text-3xl leading-tight text-ink sm:text-4xl">
              Care that begins in the clinic and continues in the community
            </h2>
            <p className="mt-6 text-base leading-relaxed text-subtle">
              A physician by training and an advocate by conviction — working across hospital wards, lecture halls and
              community programmes to make health more accessible, and leadership more human.
            </p>
            <dl className="mt-10 space-y-7 border-t border-line pt-8">
              <div>
                <dt className="font-heading text-lg text-ink">Mission</dt>
                <dd className="mt-2 text-sm leading-relaxed text-subtle">
                  To improve health outcomes by pairing rigorous clinical practice with education, mentorship and
                  community-led action.
                </dd>
              </div>
              <div>
                <dt className="font-heading text-lg text-ink">Vision</dt>
                <dd className="mt-2 text-sm leading-relaxed text-subtle">
                  A generation of clinicians and leaders who see beyond the diagnosis — and build systems that keep people
                  well.
                </dd>
              </div>
            </dl>
            <Link
              to="/about"
              className="group mt-10 inline-flex items-center gap-2 rounded-full border border-line px-6 py-3 text-sm font-medium text-ink transition-colors hover:border-teal hover:text-teal">
              
              Read More
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Featured articles */}
      <section className="border-y border-line bg-card">
        <div className="mx-auto max-w-content px-6 py-24 lg:px-10 lg:py-28">
          <SectionHeader
            eyebrow="Writing"
            title="Featured Articles"
            description="Long-form thinking on medicine, leadership and the systems that shape our health."
            action={{ label: 'All articles', to: '/articles' }} />
          
          {articles.loading ?
          <CardSkeletonGrid /> :
          articles.error ?
          <ErrorState message={articles.error} onRetry={articles.refetch} /> :
          articles.data.length === 0 ?
          <EmptyState title="No articles yet" description="Published articles will appear here as soon as they go live." /> :

          <Stagger className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {articles.data.map((article) =>
            <StaggerItem key={article.id}>
                  <ArticleCard article={article} />
                </StaggerItem>
            )}
            </Stagger>
          }
        </div>
      </section>

      {/* Gallery marquee */}
      <section className="py-24 lg:py-28">
        <div className="mx-auto max-w-content px-6 lg:px-10">
          <SectionHeader eyebrow="Gallery" title="Moments From The Work" align="center" />
        </div>
        {gallery.loading ?
        <div className="mx-auto max-w-content space-y-5 px-6 lg:px-10">
            {[0, 1, 2].map((row) =>
          <div key={row} className="flex gap-5 overflow-hidden">
                {[0, 1, 2, 3].map((item) =>
            <Skeleton key={item} className="h-40 w-64 shrink-0 rounded-xl sm:h-48 sm:w-80" />
            )}
              </div>
          )}
          </div> :
        gallery.error ?
        <div className="mx-auto max-w-content px-6 lg:px-10">
            <ErrorState message={gallery.error} onRetry={gallery.refetch} />
          </div> :
        gallery.data.length === 0 ?
        <div className="mx-auto max-w-content px-6 lg:px-10">
            <EmptyState title="No gallery images yet" description="Upload images in the admin dashboard to fill this space." />
          </div> :

        <MarqueeGallery
          images={gallery.data}
          onSelect={(image) => setLightboxIndex(gallery.data.findIndex((item) => item.id === image.id))} />

        }
        <div className="mt-12 text-center">
          <Link
            to="/gallery"
            className="inline-flex rounded-full border border-line bg-card px-7 py-3.5 text-sm font-medium text-ink transition-all hover:-translate-y-0.5 hover:border-teal hover:text-teal">
            
            View Full Gallery
          </Link>
        </div>
      </section>

      {/* Projects */}
      <section className="border-y border-line bg-card">
        <div className="mx-auto max-w-content px-6 py-24 lg:px-10 lg:py-28">
          <SectionHeader
            eyebrow="Impact"
            title="Featured Projects"
            description="Community health initiatives designed to outlast a single visit."
            action={{ label: 'All projects', to: '/projects-speaking' }} />
          
          {projects.loading ?
          <CardSkeletonGrid count={2} className="lg:grid-cols-2" /> :
          projects.error ?
          <ErrorState message={projects.error} onRetry={projects.refetch} /> :
          projects.data.length === 0 ?
          <EmptyState title="No projects yet" description="Projects added in the dashboard appear here automatically." /> :

          <Stagger className="grid gap-8 lg:grid-cols-2">
              {projects.data.map((project) =>
            <StaggerItem key={project.id}>
                  <ProjectCard project={project} />
                </StaggerItem>
            )}
            </Stagger>
          }
        </div>
      </section>

      {/* Speaking */}
      <section className="mx-auto max-w-content px-6 py-24 lg:px-10 lg:py-28">
        <SectionHeader
          eyebrow="Speaking"
          title="On Stage & In Conversation"
          description="Keynotes and panels on health equity, leadership and the future of care."
          action={{ label: 'All events', to: '/projects-speaking' }} />
        
        {events.loading ?
        <CardSkeletonGrid /> :
        events.error ?
        <ErrorState message={events.error} onRetry={events.refetch} /> :
        events.data.length === 0 ?
        <EmptyState
          title="No upcoming events"
          description="Invitations are always welcome — get in touch to discuss a date." /> :


        <Stagger className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {events.data.map((event) =>
          <StaggerItem key={event.id}>
                <EventCard event={event} />
              </StaggerItem>
          )}
          </Stagger>
        }
      </section>

      {/* Testimonials */}
      <section className="border-y border-line bg-card">
        <div className="mx-auto max-w-content px-6 py-24 lg:px-10 lg:py-28">
          <SectionHeader eyebrow="Testimonials" title="In Their Words" align="center" />
          {testimonials.loading ?
          <CardSkeletonGrid /> :
          testimonials.error ?
          <ErrorState message={testimonials.error} onRetry={testimonials.refetch} /> :
          testimonials.data.length === 0 ?
          <EmptyState title="No testimonials yet" description="Add testimonials from the admin dashboard." /> :

          <TestimonialStack testimonials={testimonials.data} />
          }
        </div>
      </section>

      <Lightbox
        images={gallery.data}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onIndexChange={setLightboxIndex} />
      
    </div>);

}