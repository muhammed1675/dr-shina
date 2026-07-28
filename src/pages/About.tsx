import React from 'react';
import { Link } from 'react-router-dom';
import { Award, BookOpen, HeartHandshake, Lightbulb, ShieldCheck, Users } from 'lucide-react';
import { PageHero } from '../components/site/PageHero';
import { Reveal, Stagger, StaggerItem } from '../components/site/Reveal';
import { SectionHeader } from '../components/site/SectionHeader';
import { useSiteSettings } from '../lib/SiteSettingsProvider';
import { HERO_IMAGES, PORTRAIT_IMAGE } from '../lib/heroImages';

const TIMELINE = [
{
  period: '2004 — 2010',
  title: 'Bachelor of Medicine, Bachelor of Surgery',
  detail: 'Clinical training with distinction in internal medicine and a first exposure to community health outreach.'
},
{
  period: '2011 — 2014',
  title: 'Residency & Internal Medicine',
  detail: 'Ward-level practice across emergency and chronic care, alongside teaching junior colleagues.'
},
{
  period: '2015 — 2018',
  title: 'Public Health & Health Systems',
  detail: 'Postgraduate study in public health, focused on preventive care and health-system design.'
},
{
  period: '2019 — 2022',
  title: 'Clinical Leadership',
  detail: 'Departmental leadership roles, quality-improvement programmes and mentorship of trainee doctors.'
},
{
  period: '2023 — Today',
  title: 'Advocacy, Speaking & Community Projects',
  detail: 'Keynotes, writing and community-led health initiatives that extend care beyond the clinic walls.'
}];


const VALUES = [
{ Icon: HeartHandshake, title: 'Compassion First', detail: 'Every decision begins with the person, not the pathology.' },
{ Icon: ShieldCheck, title: 'Integrity', detail: 'Evidence over opinion; honesty even when it is inconvenient.' },
{ Icon: BookOpen, title: 'Lifelong Learning', detail: 'Medicine rewards curiosity — and punishes complacency.' },
{ Icon: Users, title: 'Community', detail: 'Health is built collectively, long before anyone reaches a hospital.' },
{ Icon: Lightbulb, title: 'Clarity', detail: 'Complex science, explained plainly, so people can act on it.' },
{ Icon: Award, title: 'Excellence', detail: 'Standards that hold whether or not anyone is watching.' }];


const AWARDS = [
'Young Physician Leadership Award',
'Excellence in Community Health',
'National Health Advocacy Honour',
'Distinguished Mentor Recognition'];


export function About() {
  const { hero } = useSiteSettings();
  const copy = hero('about_hero');

  return (
    <div className="w-full">
      <PageHero
        image={HERO_IMAGES.about}
        eyebrow="About"
        headline={copy.headline}
        subtitle={copy.subtitle}
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'About' }]} />
      

      {/* Journey timeline */}
      <section className="mx-auto max-w-content px-6 py-24 lg:px-10 lg:py-32">
        <SectionHeader eyebrow="Journey" title="Education, Career & Leadership" />
        <ol className="relative border-l border-line pl-8 sm:pl-12">
          {TIMELINE.map((item, index) =>
          <Reveal as="li" key={item.title} delay={index * 0.06} className="relative pb-14 last:pb-0">
              <span className="absolute -left-[41px] top-1.5 flex h-3 w-3 items-center justify-center sm:-left-[57px]">
                <span className="h-3 w-3 rounded-full border-2 border-teal bg-background" />
              </span>
              <p className="text-xs uppercase tracking-[0.2em] text-teal">{item.period}</p>
              <h3 className="mt-3 font-heading text-2xl leading-snug text-ink">{item.title}</h3>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-subtle">{item.detail}</p>
            </Reveal>
          )}
        </ol>
      </section>

      {/* Mission & vision */}
      <section className="border-y border-line bg-card">
        <div className="mx-auto grid max-w-content gap-14 px-6 py-24 lg:grid-cols-2 lg:px-10 lg:py-28">
          <Reveal direction="left">
            <p className="text-xs uppercase tracking-[0.28em] text-teal">Mission</p>
            <h2 className="mt-4 font-heading text-3xl leading-tight text-ink">
              To make good health the default, not the privilege
            </h2>
            <p className="mt-5 text-base leading-relaxed text-subtle">
              Through clinical excellence, plain-spoken health education and programmes built with communities rather than
              for them — closing the gap between what medicine knows and what people can access.
            </p>
          </Reveal>
          <Reveal direction="right" delay={0.1}>
            <p className="text-xs uppercase tracking-[0.28em] text-teal">Vision</p>
            <h2 className="mt-4 font-heading text-3xl leading-tight text-ink">
              A generation of leaders who treat systems as patients
            </h2>
            <p className="mt-5 text-base leading-relaxed text-subtle">
              Clinicians and public leaders who diagnose the causes behind the illness — and have the courage, clarity and
              collaboration to treat them.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Philosophies */}
      <section className="mx-auto max-w-content space-y-24 px-6 py-24 lg:px-10 lg:py-32">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <Reveal direction="left">
            <div className="overflow-hidden rounded-2xl border border-line">
              <img
                src={PORTRAIT_IMAGE}
                alt="Dr. Oladeji working at his desk"
                className="aspect-[4/3] w-full object-cover" />
              
            </div>
          </Reveal>
          <Reveal direction="right" delay={0.08}>
            <p className="text-xs uppercase tracking-[0.28em] text-teal">Philosophy of Medicine</p>
            <h2 className="mt-4 font-heading text-3xl leading-tight text-ink">Treat the person, study the pattern</h2>
            <p className="mt-5 text-base leading-relaxed text-subtle">
              Great medicine is equal parts rigour and attention: the discipline to follow the evidence, and the presence to
              hear what a patient is really saying. Diagnosis is technical; healing rarely is.
            </p>
          </Reveal>
        </div>

        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <Reveal direction="left" className="lg:order-2">
            <div className="overflow-hidden rounded-2xl border border-line">
              <img
                src={HERO_IMAGES.projects}
                alt="Speaking to an audience at a conference"
                className="aspect-[4/3] w-full object-cover" />
              
            </div>
          </Reveal>
          <Reveal direction="right" delay={0.08} className="lg:order-1">
            <p className="text-xs uppercase tracking-[0.28em] text-teal">Philosophy of Leadership</p>
            <h2 className="mt-4 font-heading text-3xl leading-tight text-ink">Leadership is service, made visible</h2>
            <p className="mt-5 text-base leading-relaxed text-subtle">
              The best leaders in health build teams that outperform them, speak plainly about hard truths, and measure
              success in outcomes rather than in applause.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Values */}
      <section className="border-y border-line bg-card">
        <div className="mx-auto max-w-content px-6 py-24 lg:px-10 lg:py-28">
          <SectionHeader eyebrow="Core Values" title="What Guides The Work" align="center" />
          <Stagger className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {VALUES.map(({ Icon, title, detail }) =>
            <StaggerItem key={title}>
                <div className="h-full rounded-2xl border border-line bg-background p-8 transition-all duration-500 hover:-translate-y-1 hover:shadow-card">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-teal/10 text-teal">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 font-heading text-xl text-ink">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-subtle">{detail}</p>
                </div>
              </StaggerItem>
            )}
          </Stagger>
        </div>
      </section>

      {/* Awards */}
      <section className="mx-auto max-w-content px-6 py-20 lg:px-10">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.28em] text-teal">Awards & Recognitions</p>
          <ul className="mt-8 grid gap-6 border-t border-line pt-8 sm:grid-cols-2 lg:grid-cols-4">
            {AWARDS.map((award) =>
            <li key={award} className="font-heading text-lg leading-snug text-ink">
                {award}
              </li>
            )}
          </ul>
        </Reveal>
      </section>

      {/* Closing CTA */}
      <section className="bg-ink">
        <div className="mx-auto max-w-content px-6 py-24 text-center lg:px-10">
          <Reveal>
            <h2 className="mx-auto max-w-3xl font-heading text-3xl leading-tight text-white sm:text-4xl">
              Invite the conversation to your stage, newsroom or classroom
            </h2>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                to="/contact?intent=speaking"
                className="rounded-full bg-teal px-7 py-3.5 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-teal-dark">
                
                Book Speaking
              </Link>
              <Link
                to="/projects-speaking"
                className="rounded-full border border-white/25 px-7 py-3.5 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:border-white hover:bg-white/10">
                
                See Projects & Speaking
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>);

}