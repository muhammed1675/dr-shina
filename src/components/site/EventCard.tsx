import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, MapPin } from 'lucide-react';
import { SpeakingEvent } from '../../lib/types';
import { formatDate } from '../../lib/format';

export function EventCard({ event, compact = false }: {event: SpeakingEvent;compact?: boolean;}) {
  const date = formatDate(event.event_date);

  return (
    <article className="group h-full overflow-hidden rounded-2xl border border-line bg-card shadow-card transition-all duration-500 hover:-translate-y-1 hover:shadow-lift">
      <div className={`relative overflow-hidden bg-muted ${compact ? 'aspect-[16/9]' : 'aspect-[16/10]'}`}>
        {event.cover_image_url ?
        <img
          src={event.cover_image_url}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105" /> :


        <div className="flex h-full w-full items-center justify-center font-heading text-3xl text-subtle/40">
            {event.title.slice(0, 1)}
          </div>
        }
      </div>

      <div className="p-6">
        <div className="flex flex-wrap items-center gap-4 text-xs text-subtle">
          {date &&
          <span className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
              <time dateTime={event.event_date ?? undefined}>{date}</time>
            </span>
          }
          {event.location &&
          <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              {event.location}
            </span>
          }
        </div>

        <h3 className="mt-4 font-heading text-xl leading-snug text-ink">{event.title}</h3>

        {!compact &&
        <div className="mt-6">
            {event.booking_link ?
          <a
            href={event.booking_link}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex rounded-full bg-teal px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-dark">
            
                Book Speaking
              </a> :

          <Link
            to="/contact?intent=speaking"
            className="inline-flex rounded-full border border-line px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-teal hover:text-teal">
            
                Book Speaking
              </Link>
          }
          </div>
        }
      </div>
    </article>);

}