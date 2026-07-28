import React from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import { Testimonial } from '../../lib/types';

export function TestimonialStack({ testimonials }: {testimonials: Testimonial[];}) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {testimonials.map((testimonial, index) =>
      <motion.figure
        key={testimonial.id}
        initial={{ opacity: 0, y: 30, rotate: index % 2 === 0 ? -0.6 : 0.6 }}
        whileInView={{ opacity: 1, y: 0, rotate: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ y: -6 }}
        className="flex h-full flex-col rounded-2xl border border-line bg-card p-8 shadow-card">
        
          <Quote className="h-6 w-6 text-teal" aria-hidden="true" />
          <blockquote className="mt-5 flex-1 font-heading text-lg leading-relaxed text-ink">
            “{testimonial.quote}”
          </blockquote>
          <figcaption className="mt-7 flex items-center gap-3 border-t border-line pt-6">
            {testimonial.photo_url ?
          <img src={testimonial.photo_url} alt="" className="h-11 w-11 rounded-full object-cover" /> :

          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-sm text-subtle">
                {testimonial.name.slice(0, 1)}
              </span>
          }
            <span>
              <span className="block text-sm font-medium text-ink">{testimonial.name}</span>
              {testimonial.role && <span className="block text-xs text-subtle">{testimonial.role}</span>}
            </span>
          </figcaption>
        </motion.figure>
      )}
    </div>);

}