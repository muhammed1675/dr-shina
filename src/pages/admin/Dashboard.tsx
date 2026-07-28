import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, Images, Inbox, Newspaper, PlayCircle, Target, Users } from 'lucide-react';
import { AdminPageHeader } from '../../components/admin/AdminLayout';
import { useAdminStats } from '../../lib/useStats';

export function AdminDashboard() {
  const { stats, loading, error } = useAdminStats();

  const cards = [
  { label: 'Articles', value: stats.articles, to: '/admin/articles', Icon: Newspaper },
  { label: 'Gallery images', value: stats.galleryImages, to: '/admin/gallery', Icon: Images },
  { label: 'Projects', value: stats.projects, to: '/admin/projects', Icon: Target },
  { label: 'Upcoming events', value: stats.upcomingEvents, to: '/admin/events', Icon: CalendarDays },
  { label: 'Unread messages', value: stats.unreadMessages, to: '/admin/messages', Icon: Inbox, highlight: true },
  { label: 'Subscribers', value: stats.subscribers, to: '/admin/subscribers', Icon: Users },
  { label: 'Media items', value: stats.mediaItems, to: '/admin/media', Icon: PlayCircle }];


  return (
    <div>
      <AdminPageHeader
        title="Dashboard"
        description="A live snapshot of everything published on the site."
        action={
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-5 py-2.5 text-sm text-ink transition-colors hover:border-teal hover:text-teal">
          
            View site
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        } />
      

      {error &&
      <p role="alert" className="mb-6 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      }

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ label, value, to, Icon, highlight }) =>
        <Link
          key={label}
          to={to}
          className={`group rounded-xl border bg-white p-6 transition-all hover:-translate-y-0.5 hover:shadow-card ${
          highlight && value > 0 ? 'border-teal' : 'border-line'}`
          }>
          
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal/10 text-teal">
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <p className="mt-5 font-heading text-3xl text-ink">
              {loading ? <span className="inline-block h-8 w-12 animate-pulse rounded bg-ink/[0.07]" /> : value}
            </p>
            <p className="mt-1 text-sm text-subtle">{label}</p>
          </Link>
        )}
      </div>

      <div className="mt-10 grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-line bg-white p-6">
          <h2 className="font-heading text-xl text-ink">Quick actions</h2>
          <ul className="mt-5 space-y-3 text-sm">
            {[
            { label: 'Write a new article', to: '/admin/articles' },
            { label: 'Upload gallery images', to: '/admin/gallery' },
            { label: 'Add a speaking event', to: '/admin/events' },
            { label: 'Edit page headlines', to: '/admin/settings' }].
            map((item) =>
            <li key={item.to}>
                <Link to={item.to} className="group flex items-center justify-between rounded-lg border border-line px-4 py-3 transition-colors hover:border-teal">
                  {item.label}
                  <ArrowRight className="h-4 w-4 text-subtle transition-transform group-hover:translate-x-1 group-hover:text-teal" aria-hidden="true" />
                </Link>
              </li>
            )}
          </ul>
        </div>

        <div className="rounded-xl border border-line bg-white p-6">
          <h2 className="font-heading text-xl text-ink">Publishing notes</h2>
          <ul className="mt-5 space-y-3 text-sm leading-relaxed text-subtle">
            <li>Articles only appear on the public site when their status is set to <strong className="text-ink">published</strong>.</li>
            <li>Gallery order is controlled by the <strong className="text-ink">display order</strong> field (lowest first).</li>
            <li>Images are uploaded to the public <strong className="text-ink">media</strong> storage bucket.</li>
            <li>Hero headlines and contact details live in <strong className="text-ink">Site Settings</strong>.</li>
          </ul>
        </div>
      </div>
    </div>);

}