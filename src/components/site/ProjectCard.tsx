import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Project } from '../../lib/types';

export function ProjectCard({ project }: {project: Project;}) {
  const stats = Array.isArray(project.impact_stats) ? project.impact_stats : [];
  const partners = project.partners ?? [];

  return (
    <article className="group h-full overflow-hidden rounded-2xl border border-line bg-card shadow-card transition-all duration-500 hover:-translate-y-1 hover:shadow-lift">
      <div className="relative aspect-[16/9] overflow-hidden bg-muted">
        {project.cover_image_url ?
        <img
          src={project.cover_image_url}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105" /> :


        <div className="flex h-full w-full items-center justify-center font-heading text-3xl text-subtle/40">
            {project.title.slice(0, 1)}
          </div>
        }
        {project.status &&
        <span
          className={`absolute right-4 top-4 rounded-full px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] ${
          project.status === 'completed' ? 'bg-white/95 text-subtle' : 'bg-teal text-white'}`
          }>
          
            {project.status}
          </span>
        }
      </div>

      <div className="p-7 md:p-8">
        <h3 className="font-heading text-2xl leading-snug text-ink">{project.title}</h3>
        {project.description && <p className="mt-3 text-sm leading-relaxed text-subtle">{project.description}</p>}

        {stats.length > 0 &&
        <dl className="mt-7 grid grid-cols-2 gap-5 border-t border-line pt-6">
            {stats.slice(0, 4).map((stat) =>
          <div key={`${stat.label}-${stat.value}`}>
                <dd className="font-heading text-2xl text-teal-dark">{stat.value}</dd>
                <dt className="mt-1 text-xs uppercase tracking-[0.14em] text-subtle">{stat.label}</dt>
              </div>
          )}
          </dl>
        }

        {partners.length > 0 &&
        <div className="mt-6 flex flex-wrap gap-2">
            {partners.map((partner) =>
          <span key={partner} className="rounded-full border border-line px-3 py-1.5 text-xs text-subtle">
                {partner}
              </span>
          )}
          </div>
        }

        <button
          type="button"
          className="group/btn mt-7 inline-flex items-center gap-2 text-sm font-medium text-ink transition-colors hover:text-teal">
          
          View Project
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" aria-hidden="true" />
        </button>
      </div>
    </article>);

}