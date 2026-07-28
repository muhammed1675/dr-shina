import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Linkedin, Mail, MapPin, Phone, Twitter, Youtube } from 'lucide-react';
import { NewsletterForm } from './NewsletterForm';
import { useSiteSettings } from '../../lib/SiteSettingsProvider';

const QUICK_LINKS = [
{ label: 'Home', to: '/' },
{ label: 'About', to: '/about' },
{ label: 'Articles', to: '/articles' },
{ label: 'Gallery & Media', to: '/gallery' },
{ label: 'Projects & Speaking', to: '/projects-speaking' },
{ label: 'Contact', to: '/contact' }];


export function Footer() {
  const { social, contact } = useSiteSettings();

  const socials = [
  { label: 'Twitter', href: social.twitter, Icon: Twitter },
  { label: 'LinkedIn', href: social.linkedin, Icon: Linkedin },
  { label: 'Instagram', href: social.instagram, Icon: Instagram },
  { label: 'YouTube', href: social.youtube, Icon: Youtube }].
  filter((item) => Boolean(item.href));

  return (
    <footer className="w-full bg-ink text-white">
      <div className="mx-auto max-w-content px-6 py-20 lg:px-10">
        <div className="grid gap-14 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div>
            <p className="font-heading text-2xl">
              Stay close to the <span className="text-teal">work</span>
            </p>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-white/60">
              Essays on medicine, leadership and community — plus early notice of speaking events.
            </p>
            <NewsletterForm variant="dark" className="mt-7 max-w-md" />
          </div>

          <nav aria-label="Footer">
            <h2 className="text-xs uppercase tracking-[0.24em] text-white/50">Explore</h2>
            <ul className="mt-6 space-y-3">
              {QUICK_LINKS.map((link) =>
              <li key={link.to}>
                  <Link to={link.to} className="text-sm text-white/75 transition-colors hover:text-teal">
                    {link.label}
                  </Link>
                </li>
              )}
            </ul>
          </nav>

          <div>
            <h2 className="text-xs uppercase tracking-[0.24em] text-white/50">Get in touch</h2>
            <ul className="mt-6 space-y-3 text-sm text-white/75">
              {contact.email &&
              <li className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-teal" aria-hidden="true" />
                  <a href={`mailto:${contact.email}`} className="transition-colors hover:text-teal">
                    {contact.email}
                  </a>
                </li>
              }
              {contact.phone &&
              <li className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-teal" aria-hidden="true" />
                  <a href={`tel:${contact.phone}`} className="transition-colors hover:text-teal">
                    {contact.phone}
                  </a>
                </li>
              }
              {contact.location &&
              <li className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-teal" aria-hidden="true" />
                  <span>{contact.location}</span>
                </li>
              }
              <li>
                <Link
                  to="/contact?intent=speaking"
                  className="mt-2 inline-flex rounded-full border border-white/20 px-5 py-2.5 text-sm transition-colors hover:border-teal hover:text-teal">
                  
                  Book Speaking
                </Link>
              </li>
            </ul>

            {socials.length > 0 &&
            <ul className="mt-8 flex items-center gap-3">
                {socials.map(({ label, href, Icon }) =>
              <li key={label}>
                    <a
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-teal hover:text-teal">
                  
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </a>
                  </li>
              )}
              </ul>
            }
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-white/10 pt-8 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Dr. Oladeji. All rights reserved.</p>
        </div>
      </div>
    </footer>);

}