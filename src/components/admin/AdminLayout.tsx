import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  Images,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareQuote,
  Newspaper,
  PlayCircle,
  Settings,
  Target,
  Users,
  X } from
'lucide-react';
import { useAuth } from '../../lib/AuthProvider';

const NAV = [
{ to: '/admin', label: 'Dashboard', Icon: LayoutDashboard, end: true },
{ to: '/admin/articles', label: 'Articles', Icon: Newspaper },
{ to: '/admin/gallery', label: 'Gallery', Icon: Images },
{ to: '/admin/projects', label: 'Projects', Icon: Target },
{ to: '/admin/events', label: 'Speaking Events', Icon: CalendarDays },
{ to: '/admin/media', label: 'Media', Icon: PlayCircle },
{ to: '/admin/testimonials', label: 'Testimonials', Icon: MessageSquareQuote },
{ to: '/admin/messages', label: 'Messages', Icon: Inbox },
{ to: '/admin/subscribers', label: 'Subscribers', Icon: Users },
{ to: '/admin/settings', label: 'Site Settings', Icon: Settings }];


export function AdminLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="flex min-h-screen w-full bg-[#FAFAFA] text-ink">
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-line bg-white transition-transform lg:translate-x-0 ${
        open ? 'translate-x-0' : '-translate-x-full'}`
        }>
        
        <div className="flex h-16 items-center justify-between border-b border-line px-5">
          <span className="font-heading text-lg">
            Dr.<span className="text-teal">A</span> Admin
          </span>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close navigation" className="lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav aria-label="Admin" className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-1">
            {NAV.map(({ to, label, Icon, end }) =>
            <li key={to}>
                <NavLink
                to={to}
                end={end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                isActive ? 'bg-teal/10 text-teal-dark' : 'text-subtle hover:bg-black/[0.03] hover:text-ink'}`

                }>
                
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {label}
                </NavLink>
              </li>
            )}
          </ul>
        </nav>

        <div className="border-t border-line p-4">
          <p className="truncate text-xs text-subtle">{user?.email}</p>
          <button
            type="button"
            onClick={handleSignOut}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-line px-3 py-2.5 text-sm text-ink transition-colors hover:border-teal hover:text-teal">
            
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Sign out
          </button>
        </div>
      </aside>

      {open && <div className="fixed inset-0 z-30 bg-ink/40 lg:hidden" onClick={() => setOpen(false)} aria-hidden="true" />}

      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <header className="flex h-16 items-center gap-4 border-b border-line bg-white px-5 lg:hidden">
          <button type="button" onClick={() => setOpen(true)} aria-label="Open navigation">
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-heading text-lg">Admin</span>
        </header>
        <main className="flex-1 p-5 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>);

}

export function AdminPageHeader({
  title,
  description,
  action




}: {title: string;description?: string;action?: React.ReactNode;}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-heading text-2xl text-ink sm:text-3xl">{title}</h1>
        {description && <p className="mt-2 text-sm text-subtle">{description}</p>}
      </div>
      {action}
    </div>);

}