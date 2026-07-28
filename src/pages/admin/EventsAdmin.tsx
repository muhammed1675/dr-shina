import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { AdminPageHeader } from '../../components/admin/AdminLayout';
import { Column, DataTable } from '../../components/admin/DataTable';
import { ConfirmDialog, FormDrawer, ImageUploadField, SelectField, TextField } from '../../components/admin/fields';
import { useCrud } from '../../lib/useCrud';
import { SpeakingEvent } from '../../lib/types';
import { formatDate } from '../../lib/format';

interface FormState {
  title: string;
  event_date: string;
  location: string;
  cover_image_url: string;
  status: string;
  booking_link: string;
}

const EMPTY: FormState = {
  title: '',
  event_date: '',
  location: '',
  cover_image_url: '',
  status: 'upcoming',
  booking_link: ''
};

export function EventsAdmin() {
  const { rows, loading, error, saving, create, update, remove } = useCrud<SpeakingEvent>(
    'speaking_events',
    { column: 'event_date' },
    'Event'
  );
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SpeakingEvent | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [titleError, setTitleError] = useState<string | undefined>();
  const [deleting, setDeleting] = useState<SpeakingEvent | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const set = (field: keyof FormState) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === 'title') setTitleError(undefined);
  };

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setTitleError(undefined);
    setOpen(true);
  };

  const openEdit = (event: SpeakingEvent) => {
    setEditing(event);
    setForm({
      title: event.title,
      event_date: event.event_date ?? '',
      location: event.location ?? '',
      cover_image_url: event.cover_image_url ?? '',
      status: event.status ?? 'upcoming',
      booking_link: event.booking_link ?? ''
    });
    setTitleError(undefined);
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      setTitleError('A topic or title is required.');
      return;
    }
    const payload = {
      title: form.title.trim(),
      event_date: form.event_date || null,
      location: form.location.trim() || null,
      cover_image_url: form.cover_image_url || null,
      status: form.status,
      booking_link: form.booking_link.trim() || null
    };
    const success = editing ? await update(editing.id, payload) : await create(payload);
    if (success) setOpen(false);
  };

  const columns: Column<SpeakingEvent>[] = [
  {
    key: 'title',
    header: 'Topic',
    sortValue: (row) => row.title.toLowerCase(),
    render: (row) =>
    <div className="flex items-center gap-3">
          {row.cover_image_url ?
      <img src={row.cover_image_url} alt="" className="h-10 w-14 shrink-0 rounded object-cover" /> :

      <span className="h-10 w-14 shrink-0 rounded bg-black/[0.05]" />
      }
          <span className="font-medium text-ink">{row.title}</span>
        </div>

  },
  {
    key: 'event_date',
    header: 'Date',
    sortValue: (row) => row.event_date ?? '',
    render: (row) => formatDate(row.event_date, 'MMM d, yyyy') || '—'
  },
  { key: 'location', header: 'Location', sortValue: (row) => row.location ?? '', render: (row) => row.location ?? '—' },
  {
    key: 'status',
    header: 'Status',
    sortValue: (row) => row.status ?? '',
    render: (row) =>
    <span
      className={`rounded-full px-2.5 py-1 text-xs capitalize ${
      row.status === 'upcoming' ? 'bg-teal/10 text-teal-dark' : 'bg-black/[0.05] text-subtle'}`
      }>
      
          {row.status}
        </span>

  },
  {
    key: 'booking_link',
    header: 'Booking link',
    render: (row) =>
    row.booking_link ?
    <a href={row.booking_link} target="_blank" rel="noreferrer noopener" className="text-teal underline">
            Open
          </a> :

    '—'

  }];


  const filteredRows = statusFilter === 'all' ? rows : rows.filter((row) => row.status === statusFilter);

  return (
    <div>
      <AdminPageHeader
        title="Speaking events"
        description="Upcoming and past engagements shown on the Projects & Speaking page."
        action={
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-teal px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-dark">
          
            <Plus className="h-4 w-4" aria-hidden="true" />
            New event
          </button>
        } />
      

      <DataTable
        rows={filteredRows}
        columns={columns}
        loading={loading}
        error={error}
        searchFields={(row) => `${row.title} ${row.location ?? ''}`}
        searchPlaceholder="Search events"
        emptyTitle="No events yet"
        emptyDescription="Add an engagement to display it on the site."
        onEdit={openEdit}
        onDelete={setDeleting}
        filters={
        <div className="flex items-center gap-1 rounded-lg border border-line p-1">
            {['all', 'upcoming', 'past'].map((value) =>
          <button
            key={value}
            type="button"
            onClick={() => setStatusFilter(value)}
            className={`rounded-md px-3 py-1.5 text-xs capitalize transition-colors ${
            statusFilter === value ? 'bg-ink text-white' : 'text-subtle hover:text-ink'}`
            }>
            
                {value}
              </button>
          )}
          </div>
        } />
      

      <FormDrawer
        open={open}
        title={editing ? 'Edit event' : 'New event'}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
        saving={saving}
        submitLabel={editing ? 'Save changes' : 'Create event'}>
        
        <TextField label="Topic / title" required value={form.title} onChange={set('title')} error={titleError} />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Date" value={form.event_date} onChange={set('event_date')} type="date" />
          <TextField label="Location" value={form.location} onChange={set('location')} placeholder="City, venue" />
        </div>
        <ImageUploadField label="Cover / audience image" value={form.cover_image_url} onChange={set('cover_image_url')} folder="events" />
        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField
            label="Status"
            value={form.status}
            onChange={set('status')}
            options={[
            { value: 'upcoming', label: 'Upcoming' },
            { value: 'past', label: 'Past' }]
            } />
          
          <TextField label="Booking link" value={form.booking_link} onChange={set('booking_link')} placeholder="https://" />
        </div>
      </FormDrawer>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this event?"
        description={deleting ? `“${deleting.title}” will be permanently removed.` : undefined}
        busy={saving}
        onCancel={() => setDeleting(null)}
        onConfirm={async () => {
          if (deleting) await remove(deleting.id);
          setDeleting(null);
        }} />
      
    </div>);

}