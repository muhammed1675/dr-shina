import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { AdminPageHeader } from '../../components/admin/AdminLayout';
import { Column, DataTable } from '../../components/admin/DataTable';
import { ConfirmDialog, FormDrawer, ImageUploadField, SelectField, TextField } from '../../components/admin/fields';
import { useCrud } from '../../lib/useCrud';
import { MediaItem } from '../../lib/types';
import { formatDate } from '../../lib/format';

interface FormState {
  type: string;
  title: string;
  thumbnail_url: string;
  external_url: string;
  item_date: string;
}

const EMPTY: FormState = { type: 'video', title: '', thumbnail_url: '', external_url: '', item_date: '' };

const TYPES = [
{ value: 'video', label: 'Video' },
{ value: 'podcast', label: 'Podcast' },
{ value: 'tv', label: 'TV appearance' },
{ value: 'interview', label: 'Interview' },
{ value: 'publication', label: 'Publication' }];


export function MediaAdmin() {
  const { rows, loading, error, saving, create, update, remove } = useCrud<MediaItem>('media_items', { column: 'item_date' }, 'Media item');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MediaItem | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [titleError, setTitleError] = useState<string | undefined>();
  const [deleting, setDeleting] = useState<MediaItem | null>(null);
  const [typeFilter, setTypeFilter] = useState('all');

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

  const openEdit = (item: MediaItem) => {
    setEditing(item);
    setForm({
      type: item.type,
      title: item.title,
      thumbnail_url: item.thumbnail_url ?? '',
      external_url: item.external_url ?? '',
      item_date: item.item_date ?? ''
    });
    setTitleError(undefined);
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      setTitleError('A title is required.');
      return;
    }
    const payload = {
      type: form.type,
      title: form.title.trim(),
      thumbnail_url: form.thumbnail_url || null,
      external_url: form.external_url.trim() || null,
      item_date: form.item_date || null
    };
    const success = editing ? await update(editing.id, payload) : await create(payload);
    if (success) setOpen(false);
  };

  const columns: Column<MediaItem>[] = [
  {
    key: 'title',
    header: 'Item',
    sortValue: (row) => row.title.toLowerCase(),
    render: (row) =>
    <div className="flex items-center gap-3">
          {row.thumbnail_url ?
      <img src={row.thumbnail_url} alt="" className="h-10 w-14 shrink-0 rounded object-cover" /> :

      <span className="h-10 w-14 shrink-0 rounded bg-black/[0.05]" />
      }
          <span className="font-medium text-ink">{row.title}</span>
        </div>

  },
  {
    key: 'type',
    header: 'Type',
    sortValue: (row) => row.type,
    render: (row) => <span className="rounded-full bg-black/[0.05] px-2.5 py-1 text-xs capitalize text-subtle">{row.type}</span>
  },
  {
    key: 'item_date',
    header: 'Date',
    sortValue: (row) => row.item_date ?? '',
    render: (row) => formatDate(row.item_date, 'MMM d, yyyy') || '—'
  },
  {
    key: 'external_url',
    header: 'Link',
    render: (row) =>
    row.external_url ?
    <a href={row.external_url} target="_blank" rel="noreferrer noopener" className="text-teal underline">
            Open
          </a> :

    '—'

  }];


  const filteredRows = typeFilter === 'all' ? rows : rows.filter((row) => row.type === typeFilter);

  return (
    <div>
      <AdminPageHeader
        title="Media"
        description="Videos, podcasts, TV appearances, interviews and publications."
        action={
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-teal px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-dark">
          
            <Plus className="h-4 w-4" aria-hidden="true" />
            New media item
          </button>
        } />
      

      <DataTable
        rows={filteredRows}
        columns={columns}
        loading={loading}
        error={error}
        searchFields={(row) => `${row.title} ${row.type}`}
        searchPlaceholder="Search media"
        emptyTitle="No media items yet"
        emptyDescription="Add an appearance or publication to list it on the Gallery & Media page."
        onEdit={openEdit}
        onDelete={setDeleting}
        filters={
        <select
          value={typeFilter}
          onChange={(event) => setTypeFilter(event.target.value)}
          aria-label="Filter by type"
          className="h-10 rounded-lg border border-line px-3 text-sm outline-none focus:border-teal">
          
            <option value="all">All types</option>
            {TYPES.map((type) =>
          <option key={type.value} value={type.value}>
                {type.label}
              </option>
          )}
          </select>
        } />
      

      <FormDrawer
        open={open}
        title={editing ? 'Edit media item' : 'New media item'}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
        saving={saving}
        submitLabel={editing ? 'Save changes' : 'Create item'}>
        
        <SelectField label="Type" required value={form.type} onChange={set('type')} options={TYPES} />
        <TextField label="Title" required value={form.title} onChange={set('title')} error={titleError} />
        <ImageUploadField label="Thumbnail" value={form.thumbnail_url} onChange={set('thumbnail_url')} folder="media" />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="External URL" value={form.external_url} onChange={set('external_url')} placeholder="https://" />
          <TextField label="Date" value={form.item_date} onChange={set('item_date')} type="date" />
        </div>
      </FormDrawer>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this media item?"
        description={deleting ? `“${deleting.title}” will be permanently removed.` : undefined}
        busy={saving}
        onCancel={() => setDeleting(null)}
        onConfirm={async () => {
          if (deleting) await remove(deleting.id);
          setDeleting(null);
        }} />
      
    </div>);

}