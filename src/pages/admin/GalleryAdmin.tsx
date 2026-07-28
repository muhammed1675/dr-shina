import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { AdminPageHeader } from '../../components/admin/AdminLayout';
import { Column, DataTable } from '../../components/admin/DataTable';
import { ConfirmDialog, FormDrawer, ImageUploadField, TextField } from '../../components/admin/fields';
import { useCrud } from '../../lib/useCrud';
import { GalleryImage } from '../../lib/types';
import { formatDate } from '../../lib/format';

interface FormState {
  image_url: string;
  title: string;
  album: string;
  display_order: string;
}

const EMPTY: FormState = { image_url: '', title: '', album: '', display_order: '0' };

export function GalleryAdmin() {
  const { rows, loading, error, saving, create, update, remove } = useCrud<GalleryImage>(
    'gallery_images',
    { column: 'display_order', ascending: true },
    'Image'
  );
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<GalleryImage | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [imageError, setImageError] = useState<string | undefined>();
  const [deleting, setDeleting] = useState<GalleryImage | null>(null);

  const set = (field: keyof FormState) => (value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY, display_order: String(rows.length) });
    setImageError(undefined);
    setOpen(true);
  };

  const openEdit = (image: GalleryImage) => {
    setEditing(image);
    setForm({
      image_url: image.image_url,
      title: image.title ?? '',
      album: image.album ?? '',
      display_order: String(image.display_order ?? 0)
    });
    setImageError(undefined);
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.image_url) {
      setImageError('Please upload an image.');
      return;
    }
    const payload = {
      image_url: form.image_url,
      title: form.title.trim() || null,
      album: form.album.trim() || null,
      display_order: Number(form.display_order) || 0
    };
    const success = editing ? await update(editing.id, payload) : await create(payload);
    if (success) setOpen(false);
  };

  const columns: Column<GalleryImage>[] = [
  {
    key: 'image_url',
    header: 'Image',
    render: (row) => <img src={row.image_url} alt="" className="h-12 w-16 rounded object-cover" />
  },
  {
    key: 'title',
    header: 'Caption',
    sortValue: (row) => row.title ?? '',
    render: (row) => <span className="font-medium text-ink">{row.title ?? '—'}</span>
  },
  { key: 'album', header: 'Album', sortValue: (row) => row.album ?? '', render: (row) => row.album ?? '—' },
  { key: 'display_order', header: 'Order', sortValue: (row) => row.display_order ?? 0 },
  {
    key: 'created_at',
    header: 'Added',
    sortValue: (row) => row.created_at ?? '',
    render: (row) => formatDate(row.created_at ?? null, 'MMM d, yyyy')
  }];


  return (
    <div>
      <AdminPageHeader
        title="Gallery"
        description="Upload photographs and organise them into albums."
        action={
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-teal px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-dark">
          
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add image
          </button>
        } />
      

      <DataTable
        rows={rows}
        columns={columns}
        loading={loading}
        error={error}
        searchFields={(row) => `${row.title ?? ''} ${row.album ?? ''}`}
        searchPlaceholder="Search captions and albums"
        emptyTitle="No images yet"
        emptyDescription="Upload your first image to start the gallery."
        onEdit={openEdit}
        onDelete={setDeleting} />
      

      <FormDrawer
        open={open}
        title={editing ? 'Edit image' : 'Add image'}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
        saving={saving}
        submitLabel={editing ? 'Save changes' : 'Add image'}>
        
        <ImageUploadField label="Image" value={form.image_url} onChange={set('image_url')} folder="gallery" error={imageError} />
        <TextField label="Title / caption" value={form.title} onChange={set('title')} />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Album" value={form.album} onChange={set('album')} placeholder="e.g. Conferences" />
          <TextField label="Display order" value={form.display_order} onChange={set('display_order')} type="number" hint="Lowest shows first" />
        </div>
      </FormDrawer>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this image?"
        description="It will be removed from the gallery immediately."
        busy={saving}
        onCancel={() => setDeleting(null)}
        onConfirm={async () => {
          if (deleting) await remove(deleting.id);
          setDeleting(null);
        }} />
      
    </div>);

}