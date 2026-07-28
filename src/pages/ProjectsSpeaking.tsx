import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { GalleryImage, Project, SpeakingEvent, Testimonial } from '../lib/types';
import { useSupabaseQuery } from '../lib/useSupabaseQuery';
import { useSiteSettings } from '../lib/SiteSettingsProvider';
import { HERO_IMAGES } from '../lib/heroImages';
import { formatDate } from '../lib/format';
import { PageHero } from '../components/site/PageHero';
import { SectionHeader } from '../components/site/SectionHeader';
import { ProjectCard } from '../components/site/ProjectCard';
import { EventCard } from '../components/site/EventCard';
import { TestimonialStack } from '../components/site/Testimonials';
import { MarqueeRow } from '../components/site/Marquee';
import { Lightbox } from '../components/site/Lightbox';
import { Reveal, Stagger, StaggerItem } from '../components/site/Reveal';
import { CardSkeletonGrid, EmptyState, ErrorState } from '../components/site/states';

export function ProjectsSpeaking() {
  const { hero } = useSiteSettings();
  const copy = hero('projects_hero');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const projects = useSupabaseQuery<Project>(
    () => supabase.from('projects').select('*').order('created_at', { ascending: false }),
    []
  );

  const events = useSupabaseQuery<SpeakingEvent>(
    () => supabase.from('speaking_events').select('*').order('event_date', { ascending: false, nullsFirst: false }),
    []
  );

  const testimonials = useSupabaseQuery<Testimonial>(
    () => supabase.from('testimonials').select('*').order('display_order', { ascending: true }),
    []
  );

  const conferencePhotos = useSupabaseQuery<GalleryImage>(
    () => supabase.from('gallery_images').select('*').order('display_order', { ascending: true }).limit(14),
    []
  );

  const upcoming = useMemo(
    () =>
    events.data.
    filter((event) => event.status === 'upcoming').
    sort((a, b) => (a.event_date ?? '').localeCompare(b.event_date ?? '')),
    [events.data]
  );
  const past = useMemo(() => events.data.filter((event) => event.status !== 'upcoming'), [events.data]);

  return (
    <div className="w-full">
      <PageHero
        image={HERO_IMAGES.projects}
        eyebrow="Projects & Speaking"
        headline={copy.headline}
        subtitle={copy.subtitle}
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Projects & Speaking' }]}>
        
        <Link
          to="/contact?intent=speaking"
          className="inline-flex rounded-full bg-teal px-7 py-3.5 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-teal-dark">
          
          Book Speaking
        </Link>
      </PageHero>

      {/* Projects */}
      <section id="projects" className="mx-auto max-w-content px-6 py-24 lg:px-10 lg:py-28">
        <SectionHeader
          eyebrow="Projects"
          title="Community Health In Practice"
          description="Initiatives built with communities, measured by what changes after we leave." />
        
        {projects.loading ?
        <CardSkeletonGrid count={2} className="lg:grid-cols-2" /> :
        projects.error ?
        <ErrorState message={projects.error} onRetry={projects.refetch} /> :
        projects.data.length === 0 ?
        <EmptyState title="No projects yet" description="Projects added in the dashboard will be listed here." /> :

        <Stagger className="grid gap-8 lg:grid-cols-2">
            {projects.data.map((project) =>
          <StaggerItem key={project.id}>
                <ProjectCard project={project} />
              </StaggerItem>
          )}
          </Stagger>
        }

        {/* Community timeline */}
        {projects.data.length > 0 &&
        <div className="mt-24">
            <Reveal>
              <h3 className="mb-10 font-heading text-2xl text-ink">Community timeline</h3>
            </Reveal>
            <ol className="relative border-l border-line pl-8">
              {projects.data.map((project, index) =>
            <Reveal as="li" key={project.id} delay={index * 0.05} className="relative pb-10 last:pb-0">
                  <span className="absolute -left-[41px] top-1.5 h-3 w-3 rounded-full border-2 border-teal bg-background" />
                  <p className="text-xs uppercase tracking-[0.2em] text-teal">
                    {formatDate(project.created_at ?? null, 'MMMM yyyy')}
                  </p>
                  <p className="mt-2 font-heading text-xl text-ink">{project.title}</p>
                  {project.description &&
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-subtle">{project.description}</p>
              }
                </Reveal>
            )}
            </ol>
          </div>
        }
      </section>

      {/* Speaking */}
      <section id="speaking" className="border-y border-line bg-card">
        <div className="mx-auto max-w-content px-6 py-24 lg:px-10 lg:py-28">
          <SectionHeader
            eyebrow="Speaking"
            title="Upcoming Engagements"
            description="Keynotes, panels and lectures on health equity, leadership and the future of care." />
          
          {events.loading ?
          <CardSkeletonGrid /> :
          events.error ?
          <ErrorState message={events.error} onRetry={events.refetch} /> :
          upcoming.length === 0 ?
          <EmptyState
            title="No upcoming events scheduled"
            description="Dates open up regularly — reach out to discuss an invitation." /> :


          <Stagger className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {upcoming.map((event) =>
            <StaggerItem key={event.id}>
                  <EventCard event={event} />
                </StaggerItem>
            )}
            </Stagger>
          }

          {past.length > 0 &&
          <div className="mt-24">
              <Reveal>
                <h3 className="mb-10 font-heading text-2xl text-ink">Past events</h3>
              </Reveal>
              <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {past.map((event) =>
              <StaggerItem key={event.id}>
                    <EventCard event={event} compact />
                  </StaggerItem>
              )}
              </Stagger>
            </div>
          }
        </div>
      </section>

      {/* Conference photo strip */}
      {conferencePhotos.data.length > 0 &&
      <section className="py-20">
          <div className="mx-auto max-w-content px-6 lg:px-10">
            <SectionHeader eyebrow="On stage" title="From The Room" align="center" />
          </div>
          <MarqueeRow
          images={conferencePhotos.data}
          direction="left"
          duration={80}
          onSelect={(image) => setLightboxIndex(conferencePhotos.data.findIndex((item) => item.id === image.id))} />
        
        </section>
      }

      {/* Testimonials */}
      <section className="border-t border-line bg-card">
        <div className="mx-auto max-w-content px-6 py-24 lg:px-10 lg:py-28">
          <SectionHeader eyebrow="Speaking testimonials" title="What Organisers Say" align="center" />
          {testimonials.loading ?
          <CardSkeletonGrid /> :
          testimonials.data.length === 0 ?
          <EmptyState title="No testimonials yet" /> :

          <TestimonialStack testimonials={testimonials.data} />
          }
        </div>
      </section>

      <section className="bg-ink">
        <div className="mx-auto max-w-content px-6 py-24 text-center lg:px-10">
          <Reveal>
            <h2 className="mx-auto max-w-3xl font-heading text-3xl leading-tight text-white sm:text-4xl">
              Bring this conversation to your audience
            </h2>
            <Link
              to="/contact?intent=speaking"
              className="mt-10 inline-flex rounded-full bg-teal px-8 py-3.5 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-teal-dark">
              
              Book Speaking
            </Link>
          </Reveal>
        </div>
      </section>

      <Lightbox
        images={conferencePhotos.data}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onIndexChange={setLightboxIndex} />
      
    </div>);

}