import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

interface Crumb {
  label: string;
  to?: string;
}

interface PageHeroProps {
  image: string;
  headline: string;
  subtitle?: string;
  eyebrow?: string;
  breadcrumbs?: Crumb[];
  height?: 'full' | 'page';
  align?: 'left' | 'center';
  children?: React.ReactNode;
  imageAlt?: string;
}

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } }
};

const item = {
  hidden: { opacity: 0, y: 26 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] } }
};

export function PageHero({
  image,
  headline,
  subtitle,
  eyebrow,
  breadcrumbs,
  height = 'page',
  align = 'left',
  children,
  imageAlt = ''
}: PageHeroProps) {
  return (
    <section
      className={`relative flex w-full items-end overflow-hidden bg-ink ${
      height === 'full' ? 'min-h-[88vh] pt-32 pb-20' : 'min-h-[62vh] pt-32 pb-16 md:min-h-[68vh]'}`
      }>
      
      <div className="absolute inset-0">
        <img
          src={image}
          alt={imageAlt}
          aria-hidden={imageAlt === '' ? true : undefined}
          className="h-full w-full origin-center object-cover animate-kenburns" />
        
        <div className="absolute inset-0 bg-ink/60" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink/70 to-transparent" />
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className={`relative mx-auto w-full max-w-content px-6 lg:px-10 ${
        align === 'center' ? 'text-center' : ''}`
        }>
        
        {breadcrumbs && breadcrumbs.length > 0 &&
        <motion.nav variants={item} aria-label="Breadcrumb" className="mb-6">
            <ol className={`flex flex-wrap items-center gap-1 text-sm text-white/70 ${align === 'center' ? 'justify-center' : ''}`}>
              {breadcrumbs.map((crumb, index) =>
            <li key={crumb.label} className="flex items-center gap-1">
                  {crumb.to ?
              <Link to={crumb.to} className="transition-colors hover:text-white">
                      {crumb.label}
                    </Link> :

              <span aria-current="page" className="text-white">
                      {crumb.label}
                    </span>
              }
                  {index < breadcrumbs.length - 1 && <ChevronRight className="h-3.5 w-3.5 text-white/40" aria-hidden="true" />}
                </li>
            )}
            </ol>
          </motion.nav>
        }

        {eyebrow &&
        <motion.p variants={item} className="mb-4 text-xs uppercase tracking-[0.28em] text-teal">
            {eyebrow}
          </motion.p>
        }

        <motion.h1
          variants={item}
          className={`font-heading text-4xl leading-[1.08] text-white sm:text-5xl lg:text-6xl ${
          align === 'center' ? 'mx-auto max-w-4xl' : 'max-w-4xl'}`
          }>
          
          {headline}
        </motion.h1>

        {subtitle &&
        <motion.p
          variants={item}
          className={`mt-6 text-lg leading-relaxed text-white/80 ${align === 'center' ? 'mx-auto max-w-2xl' : 'max-w-2xl'}`}>
          
            {subtitle}
          </motion.p>
        }

        {children &&
        <motion.div variants={item} className="mt-10">
            {children}
          </motion.div>
        }
      </motion.div>
    </section>);

}