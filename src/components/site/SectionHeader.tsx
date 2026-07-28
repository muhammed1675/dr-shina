import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Reveal } from './Reveal';

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: {label: string;to: string;};
  align?: 'left' | 'center';
}

export function SectionHeader({ eyebrow, title, description, action, align = 'left' }: SectionHeaderProps) {
  return (
    <Reveal className={`mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between ${align === 'center' ? 'text-center md:flex-col md:items-center' : ''}`}>
      <div className={align === 'center' ? 'mx-auto max-w-2xl' : 'max-w-2xl'}>
        {eyebrow && <p className="mb-3 text-xs uppercase tracking-[0.28em] text-teal">{eyebrow}</p>}
        <h2 className="font-heading text-3xl leading-tight text-ink sm:text-4xl">{title}</h2>
        {description && <p className="mt-4 text-base leading-relaxed text-subtle">{description}</p>}
      </div>
      {action &&
      <Link
        to={action.to}
        className="group inline-flex shrink-0 items-center gap-2 text-sm font-medium text-ink transition-colors hover:text-teal">
        
          {action.label}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </Link>
      }
    </Reveal>);

}