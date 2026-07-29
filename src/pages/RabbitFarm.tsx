import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  Leaf,
  Loader2,
  Rabbit as RabbitIcon,
  ShieldCheck,
  Sprout,
  Users } from
'lucide-react';
import { toast } from 'sonner';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { GalleryImage, RabbitBreed, RabbitGalleryImage, RabbitPost } from '../lib/types';
import { useSupabaseQuery } from '../lib/useSupabaseQuery';
import { useSiteSettings } from '../lib/SiteSettingsProvider';
import { HERO_IMAGES } from '../lib/heroImages';
import { formatDate } from '../lib/format';
import { PageHero } from '../components/site/PageHero';
import { SectionHeader } from '../components/site/SectionHeader';
import { Reveal } from '../components/site/Reveal';
import { Lightbox } from '../components/site/Lightbox';
import { CardSkeletonGrid, EmptyState, ErrorState, Skeleton } from '../components/site/states';

const SECTIONS = [
{ id: 'overview', label: 'Overview' },
{ id: 'stock', label: 'Our Rabbits' },
{ id: 'gallery', label: 'Gallery' },
{ id: 'journal', label: 'Farm Journal' },
{ id: 'visit', label: 'Visit / Enquire' }];


const PILLARS = [
{
  Icon: ShieldCheck,
  title: 'Clinically minded husbandry',
  copy: 'Biosecurity, vaccination records and clean housing — the same standards of hygiene we hold in the clinic.'
},
{
  Icon: Leaf,
  title: 'Lean, affordable protein',
  copy: 'Rabbit meat is high in protein and low in cholesterol — a practical answer to malnutrition in our communities.'
},
{
  Icon: Users,
  title: 'Training & mentorship',
  copy: 'Young farmers and cooperatives are trained on breeding, feeding and record-keeping they can actually sustain.'
},
{
  Icon: Sprout,
  title: 'Circular and low-waste',
  copy: 'Manure feeds vegetable plots; feed is sourced locally. The farm gives back more than it takes.'
}];


const FAQS = [
{
  q: 'Can I buy breeding stock or table rabbits?',
  a: 'Yes. Weaners, grown-outs and proven breeding pairs are available depending on the season. Send an enquiry below and you will get current availability and pricing.'
},
{
  q: 'Do you deliver outside the state?',
  a: 'Live animals travel best over short distances. We arrange transport for bulk orders and can advise on safe handling for longer journeys.'
},
{
  q: 'Do you train beginners?',
  a: 'We run practical, hands-on sessions on housing, feeding, breeding cycles and record-keeping — for individuals, cooperatives and school groups.'
},
{
  q: 'Can I visit the farm?',
  a: 'Farm visits are by appointment so we can protect biosecurity. Use the enquiry form to request a date.'
}];


const INTERESTS = [
'Buy rabbits',
'Breeding stock',
'Training / mentorship',
'Farm visit',
'Partnership / supply',
'Other'];


function scrollToSection(id: string) {
  const element = document.getElementById(id);
  if (!element) return;
  const top = element.getBoundingClientRect().top + window.scrollY - 96;
  window.scrollTo({ top, behavior: 'smooth' });
}

function availabilityStyle(value: string | null): {label: string;className: string;} {
  switch (value) {
    case 'sold_out':
      return { label: 'Sold out', className: 'bg-ink/8 text-subtle' };
    case 'limited':
      return { label: 'Limited', className: 'bg-amber-500/12 text-amber-700' };
    default:
      return { label: 'Available', className: 'bg-teal/10 text-teal-dark' };
  }
}

export function RabbitFarm() {
  const { hero } = useSiteSettings();
  const copy = hero('rabbit_hero');

  const breeds = useSupabaseQuery<RabbitBreed>(
    () => supabase.from('rabbit_breeds').select('*').order('display_order', { ascending: true, nullsFirst: false }),
    []
  );

  const gallery = useSupabaseQuery<RabbitGalleryImage>(
    () => supabase.from('rabbit_gallery').select('*').order('display_order', { ascending: true, nullsFirst: false }),
    []
  );

  const posts = useSupabaseQuery<RabbitPost>(
    () =>
    supabase.
    from('rabbit_posts').
    select('*').
    eq('status', 'published').
    order('published_at', { ascending: false, nullsFirst: false }),
    []
  );

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [openPost, setOpenPost] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const [form, setForm] = useState({ name: '', email: '', phone: '', interest: INTERESTS[0], message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const setField = (field: keyof typeof form) => (value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const featuredPost = posts.data[0] ?? null;
  const restPosts = useMemo(() => posts.data.slice(1), [posts.data]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isSupabaseConfigured) {
      toast.error('The farm enquiry form is not connected yet.');
      return;
    }
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error('Please add your name, email and a short message.');
      return;
    }
    setSending(true);
    const { error } = await supabase.from('rabbit_enquiries').insert({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      interest: form.interest,
      message: form.message.trim()
    });
    setSending(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSent(true);
    setForm({ name: '', email: '', phone: '', interest: INTERESTS[0], message: '' });
    toast.success('Enquiry sent — we will get back to you shortly.');
  };

  const inputClass =
  'w-full rounded-lg border border-line bg-white px-4 py-3 text-base text-ink outline-none transition-colors placeholder:text-subtle/60 focus:border-teal';

  return (
    <div className="w-full">
      <PageHero
        image={HERO_IMAGES.rabbit}
        eyebrow="Rabbit Farm"
        headline={copy.headline}
        subtitle={copy.subtitle}
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Rabbit Farm' }]}>
        
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => scrollToSection('stock')}
            className="inline-flex items-center gap-2 rounded-full bg-teal px-6 py-3 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-teal-dark">
            
            See available rabbits
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('visit')}
            className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 text-sm font-medium text-white transition-colors hover:border-teal hover:text-teal">
            
            Enquire / visit the farm
          </button>
        </div>
      </PageHero>

      {/* Sticky in-page navigation */}
      <div className="sticky top-20 z-30 border-b border-line bg-white/95 backdrop-blur-sm">
        <div className="mx-auto max-w-content px-6 lg:px-10">
          <ul className="flex gap-2 overflow-x-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {SECTIONS.map((section) =>
            <li key={section.id}>
                <button
                type="button"
                onClick={() => scrollToSection(section.id)}
                className="whitespace-nowrap rounded-full border border-line px-4 py-2 text-sm text-subtle transition-colors hover:border-teal hover:text-teal">
                
                  {section.label}
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Overview */}
      <section id="overview" className="mx-auto max-w-content scroll-mt-32 px-6 py-20 lg:px-10 lg:py-24">
        <div className="grid gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <Reveal>
            <p className="mb-3 text-xs uppercase tracking-[0.28em] text-teal">The farm</p>
            <h2 className="font-heading text-3xl leading-tight text-ink sm:text-4xl">
              Medicine treats the patient. Farming feeds the community.
            </h2>
            <div className="mt-6 space-y-4 text-base leading-relaxed text-subtle">
              <p>
                The rabbitry began as a small backyard experiment in affordable protein and grew into a working farm that
                supplies families, restaurants and fellow farmers with healthy stock.
              </p>
              <p>
                Every hutch is run with the discipline of a ward round: records for every doe and buck, scheduled health
                checks, controlled feeding and strict visitor biosecurity. That is why our animals travel well and our
                breeding lines stay strong.
              </p>
              <p>
                Beyond sales, the farm is a teaching space — a place where young people learn that enterprise and public
                health can grow from the same soil.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1} className="grid gap-5 sm:grid-cols-2">
            {PILLARS.map(({ Icon, title, copy: text }) =>
            <div key={title} className="rounded-2xl border border-line bg-card p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-teal/10 text-teal">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-heading text-lg text-ink">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-subtle">{text}</p>
              </div>
            )}
          </Reveal>
        </div>
      </section>

      {/* Stock / breeds */}
      <section id="stock" className="w-full scroll-mt-32 bg-[#FAFAFA] py-20 lg:py-24">
        <div className="mx-auto max-w-content px-6 lg:px-10">
          <SectionHeader
            eyebrow="Our rabbits"
            title="Breeds & stock"
            description="Breeding pairs, weaners and table rabbits — availability is updated from the farm records." />
          

          {breeds.loading ?
          <CardSkeletonGrid count={3} /> :
          breeds.error ?
          <ErrorState message={breeds.error} onRetry={breeds.refetch} /> :
          breeds.data.length === 0 ?
          <EmptyState
            title="Stock list coming soon"
            description="Breed listings will appear here once they are added in the admin dashboard."
            icon={<RabbitIcon className="h-5 w-5" aria-hidden="true" />} /> :


          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {breeds.data.map((breed, index) => {
              const badge = availabilityStyle(breed.availability);
              return (
                <motion.article
                  key={breed.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.6, delay: index % 3 * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  className="group overflow-hidden rounded-2xl border border-line bg-card">
                  
                    <div className="aspect-[16/10] w-full overflow-hidden bg-ink/5">
                      {breed.image_url ?
                    <img
                      src={breed.image_url}
                      alt={breed.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" /> :

                    <div className="flex h-full w-full items-center justify-center text-subtle">
                          <RabbitIcon className="h-8 w-8" aria-hidden="true" />
                        </div>
                    }
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="font-heading text-xl text-ink">{breed.name}</h3>
                        <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${badge.className}`}>
                          {badge.label}
                        </span>
                      </div>
                      {breed.description &&
                    <p className="mt-3 text-sm leading-relaxed text-subtle">{breed.description}</p>
                    }
                      {breed.price &&
                    <p className="mt-4 text-sm font-medium text-ink">{breed.price}</p>
                    }
                      <button
                      type="button"
                      onClick={() => {
                        setField('interest')('Buy rabbits');
                        setField('message')(`I'd like to enquire about the ${breed.name}.`);
                        scrollToSection('visit');
                      }}
                      className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-teal transition-colors hover:text-teal-dark">
                      
                        Enquire about this breed
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </motion.article>);

            })}
            </div>
          }
        </div>
      </section>

      {/* Gallery */}
      <section id="gallery" className="mx-auto max-w-content scroll-mt-32 px-6 py-20 lg:px-10 lg:py-24">
        <SectionHeader
          eyebrow="Gallery"
          title="Life on the farm"
          description="Hutches, litters, feed runs and the people who keep it all going." />
        

        {gallery.loading ?
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) =>
          <Skeleton key={index} className="aspect-[4/3] w-full" />
          )}
          </div> :
        gallery.error ?
        <ErrorState message={gallery.error} onRetry={gallery.refetch} /> :
        gallery.data.length === 0 ?
        <EmptyState title="No photos yet" description="Farm photos added in the admin dashboard will show up here." /> :

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {gallery.data.map((image, index) =>
          <motion.button
            key={image.id}
            type="button"
            onClick={() => setLightboxIndex(index)}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55, delay: index % 3 * 0.06, ease: [0.22, 1, 0.36, 1] }}
            className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-ink/5"
            aria-label={image.title ?? 'Open image'}>
            
                <img
              src={image.image_url}
              alt={image.title ?? ''}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            
                {image.title &&
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 to-transparent px-4 pb-3 pt-10 text-left text-sm text-white opacity-0 transition-opacity group-hover:opacity-100">
                    {image.title}
                  </span>
            }
              </motion.button>
          )}
          </div>
        }

        <Lightbox
          images={gallery.data as GalleryImage[]}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onIndexChange={setLightboxIndex} />
        
      </section>

      {/* Journal / blog */}
      <section id="journal" className="w-full scroll-mt-32 bg-[#FAFAFA] py-20 lg:py-24">
        <div className="mx-auto max-w-content px-6 lg:px-10">
          <SectionHeader
            eyebrow="Farm journal"
            title="Notes from the rabbitry"
            description="Practical write-ups on breeding, feeding, health and the business of small livestock." />
          

          {posts.loading ?
          <CardSkeletonGrid count={3} /> :
          posts.error ?
          <ErrorState message={posts.error} onRetry={posts.refetch} /> :
          posts.data.length === 0 ?
          <EmptyState title="No posts yet" description="Published farm journal entries will appear here." /> :

          <div className="space-y-10">
              {featuredPost &&
            <Reveal className="overflow-hidden rounded-2xl border border-line bg-card lg:grid lg:grid-cols-2">
                  {featuredPost.cover_image_url &&
              <div className="aspect-[16/10] w-full overflow-hidden bg-ink/5 lg:aspect-auto lg:h-full">
                      <img
                  src={featuredPost.cover_image_url}
                  alt={featuredPost.title}
                  className="h-full w-full object-cover" />
                
                    </div>
              }
                  <div className="p-7 lg:p-10">
                    <p className="text-xs uppercase tracking-[0.24em] text-teal">Latest</p>
                    <h3 className="mt-4 font-heading text-2xl leading-tight text-ink sm:text-3xl">
                      {featuredPost.title}
                    </h3>
                    <p className="mt-2 text-sm text-subtle">
                      {formatDate(featuredPost.published_at ?? featuredPost.created_at ?? null)}
                    </p>
                    {featuredPost.excerpt &&
                <p className="mt-4 text-base leading-relaxed text-subtle">{featuredPost.excerpt}</p>
                }
                    {openPost === featuredPost.id && featuredPost.body &&
                <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-ink/85">{featuredPost.body}</p>
                }
                    {featuredPost.body &&
                <button
                  type="button"
                  onClick={() => setOpenPost(openPost === featuredPost.id ? null : featuredPost.id)}
                  className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-teal transition-colors hover:text-teal-dark">
                  
                        {openPost === featuredPost.id ? 'Show less' : 'Read the full entry'}
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </button>
                }
                  </div>
                </Reveal>
            }

              {restPosts.length > 0 &&
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {restPosts.map((post, index) =>
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.6, delay: index % 3 * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden rounded-2xl border border-line bg-card">
                
                      {post.cover_image_url &&
                <div className="aspect-[16/10] w-full overflow-hidden bg-ink/5">
                          <img src={post.cover_image_url} alt={post.title} loading="lazy" className="h-full w-full object-cover" />
                        </div>
                }
                      <div className="p-6">
                        <p className="text-xs text-subtle">
                          {formatDate(post.published_at ?? post.created_at ?? null)}
                        </p>
                        <h3 className="mt-2 font-heading text-lg leading-snug text-ink">{post.title}</h3>
                        {post.excerpt && <p className="mt-3 text-sm leading-relaxed text-subtle">{post.excerpt}</p>}
                        {openPost === post.id && post.body &&
                  <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink/85">{post.body}</p>
                  }
                        {post.body &&
                  <button
                    type="button"
                    onClick={() => setOpenPost(openPost === post.id ? null : post.id)}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-teal transition-colors hover:text-teal-dark">
                    
                            {openPost === post.id ? 'Show less' : 'Read more'}
                            <ArrowRight className="h-4 w-4" aria-hidden="true" />
                          </button>
                  }
                      </div>
                    </motion.article>
              )}
                </div>
            }
            </div>
          }
        </div>
      </section>

      {/* FAQ + enquiry */}
      <section id="visit" className="mx-auto max-w-content scroll-mt-32 px-6 py-20 lg:px-10 lg:py-24">
        <div className="grid gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <Reveal>
            <p className="mb-3 text-xs uppercase tracking-[0.28em] text-teal">Good to know</p>
            <h2 className="font-heading text-3xl leading-tight text-ink sm:text-4xl">Frequently asked</h2>
            <ul className="mt-8 divide-y divide-line border-y border-line">
              {FAQS.map((faq, index) =>
              <li key={faq.q}>
                  <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  aria-expanded={openFaq === index}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left">
                  
                    <span className="font-medium text-ink">{faq.q}</span>
                    <span className="text-teal">{openFaq === index ? '−' : '+'}</span>
                  </button>
                  {openFaq === index &&
                <p className="-mt-1 pb-5 text-sm leading-relaxed text-subtle">{faq.a}</p>
                }
                </li>
              )}
            </ul>
          </Reveal>

          <Reveal delay={0.1} className="rounded-2xl border border-line bg-card p-7 sm:p-9">
            <h2 className="font-heading text-2xl text-ink">Enquire or book a farm visit</h2>
            <p className="mt-2 text-sm leading-relaxed text-subtle">
              Tell us what you need — stock, training, a visit or a supply partnership — and you will get a reply with
              current availability.
            </p>

            {sent ?
            <div className="mt-8 flex items-start gap-3 rounded-xl border border-teal/30 bg-teal/5 p-5">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-teal" aria-hidden="true" />
                <div>
                  <p className="font-medium text-ink">Enquiry received</p>
                  <p className="mt-1 text-sm text-subtle">
                    Thank you — we will be in touch shortly.{' '}
                    <button type="button" onClick={() => setSent(false)} className="font-medium text-teal underline">
                      Send another
                    </button>
                  </p>
                </div>
              </div> :

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="rf-name" className="mb-1.5 block text-sm font-medium text-ink">
                      Name <span className="text-teal">*</span>
                    </label>
                    <input
                    id="rf-name"
                    value={form.name}
                    onChange={(event) => setField('name')(event.target.value)}
                    className={inputClass}
                    required />
                  
                  </div>
                  <div>
                    <label htmlFor="rf-email" className="mb-1.5 block text-sm font-medium text-ink">
                      Email <span className="text-teal">*</span>
                    </label>
                    <input
                    id="rf-email"
                    type="email"
                    value={form.email}
                    onChange={(event) => setField('email')(event.target.value)}
                    className={inputClass}
                    required />
                  
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="rf-phone" className="mb-1.5 block text-sm font-medium text-ink">
                      Phone
                    </label>
                    <input
                    id="rf-phone"
                    value={form.phone}
                    onChange={(event) => setField('phone')(event.target.value)}
                    className={inputClass} />
                  
                  </div>
                  <div>
                    <label htmlFor="rf-interest" className="mb-1.5 block text-sm font-medium text-ink">
                      I'm interested in
                    </label>
                    <select
                    id="rf-interest"
                    value={form.interest}
                    onChange={(event) => setField('interest')(event.target.value)}
                    className={inputClass}>
                    
                      {INTERESTS.map((item) =>
                    <option key={item} value={item}>
                          {item}
                        </option>
                    )}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="rf-message" className="mb-1.5 block text-sm font-medium text-ink">
                    Message <span className="text-teal">*</span>
                  </label>
                  <textarea
                  id="rf-message"
                  rows={5}
                  value={form.message}
                  onChange={(event) => setField('message')(event.target.value)}
                  className={inputClass}
                  required />
                
                </div>

                <button
                type="submit"
                disabled={sending}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-teal px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-teal-dark disabled:opacity-60 sm:w-auto">
                
                  {sending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                  Send enquiry
                </button>
              </form>
            }
          </Reveal>
        </div>
      </section>
    </div>);

}
