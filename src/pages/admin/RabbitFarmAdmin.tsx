import React, { useState } from 'react';
import { Check, Plus } from 'lucide-react';
import { AdminPageHeader } from '../../components/admin/AdminLayout';
import { Column, DataTable } from '../../components/admin/DataTable';
import {
  ConfirmDialog,
  FormDrawer,
  ImageUploadField,
  SelectField,
  TextAreaField,
  TextField } from
'../../components/admin/fields';
import { useCrud } from '../../lib/useCrud';
import { RabbitBreed, RabbitEnquiry, RabbitGalleryImage, RabbitPost } from '../../lib/types';
import { formatDate, slugify } from '../../lib/format';

const TABS = [
{ id: 'breeds', label: 'Breeds & stock' },
{ id: 'gallery', label: 'Farm gallery' },
{ id: 'posts', label: 'Farm journal' },
{ id: 'enquiries', label: 'Enquiries' }] as
const;

type TabId = typeof TABS[number]['id'];

export function RabbitFarmAdmin() {
  const [tab, setTab] = useState<TabId>('breeds');

  return (
    <div>
      <AdminPageHeader
        title="Rabbit farm"
        description="Manage the stock list, farm photos, journal posts and enquiries from the Rabbit Farm page." />
      

      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((item) =>
        <button
          key={item.id}
          type="button"
          onClick={() => setTab(item.id)}
          className={`rounded-full px-4 py-2 text-sm transition-colors ${
          tab === item.id ? 'bg-teal text-white' : 'border border-line text-subtle hover:border-teal hover:text-teal'}`
          }>
          
            {item.label}
          </button>
        )}
      </div>

      {tab === 'breeds' && <BreedsPanel />}
      {tab === 'gallery' && <GalleryPanel />}
      {tab === 'posts' && <PostsPanel />}
      {tab === 'enquiries' && <EnquiriesPanel />}
    </div>);

}

/* ------------------------------- Breeds ---------------------------------- */

interface BreedForm {
  name: string;
  image_url: string;
  description: string;
  price: string;
  availability: string;
  display_order: string;
}

const EMPTY_BREED: BreedForm = {
  name: '',
  image_url: '',
  description: '',
  price: '',
  availability: 'available',
  display_order: '0'
};

const AVAILABILITY = [
{ value: 'available', label: 'Available' },
{ value: 'limited', label: 'Limited' },
{ value: 'sold_out', label: 'Sold out' }];


function BreedsPanel() {
  const { rows, loading, error, saving, create, update, remove } = useCrud<RabbitBreed>(
    'rabbit_breeds',
    { column: 'display_order', ascending: true },
    'Breed'
  );
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<RabbitBreed | null>(null);
  const [form, setForm] = useState<BreedForm>(EMPTY_BREED);
  const [nameError, setNameError] = useState<string | undefined>();
  const [deleting, setDeleting] = useState<RabbitBreed | null>(null);

  const set = (field: keyof BreedForm) => (value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY_BREED, display_order: String(rows.length) });
    setNameError(undefined);
    setOpen(true);
  };

  const openEdit = (breed: RabbitBreed) => {
    setEditing(breed);
    setForm({
      name: breed.name,
      image_url: breed.image_url ?? '',
      description: breed.description ?? '',
      price: breed.price ?? '',
      availability: breed.availability ?? 'available',
      display_order: String(breed.display_order ?? 0)
    });
    setNameError(undefined);
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setNameError('Please add a breed name.');
      return;
    }
    const payload = {
      name: form.name.trim(),
      image_url: form.image_url || null,
      description: form.description.trim() || null,
      price: form.price.trim() || null,
      availability: form.availability,
      display_order: Number(form.display_order) || 0
    };
    const success = editing ? await update(editing.id, payload) : await create(payload);
    if (success) setOpen(false);
  };

  const columns: Column<RabbitBreed>[] = [
  {
    key: 'image_url',
    header: 'Photo',
    render: (row) =>
    row.image_url ?
    <img src={row.image_url} alt="" className="h-12 w-16 rounded object-cover" /> :

    <span className="text-subtle">—</span>

  },
  {
    key: 'name',
    header: 'Breed',
    sortValue: (row) => row.name,
    render: (row) => <span className="font-medium text-ink">{row.name}</span>
  },
  { key: 'price', header: 'Price', render: (row) => row.price ?? '—' },
  {
    key: 'availability',
    header: 'Availability',
    sortValue: (row) => row.availability ?? '',
    render: (row) =>
    <span className="rounded-full bg-teal/10 px-3 py-1 text-xs font-medium text-teal-dark">
          {AVAILABILITY.find((item) => item.value === row.availability)?.label ?? 'Available'}
        </span>

  },
  { key: 'display_order', header: 'Order', sortValue: (row) => row.display_order ?? 0 }];


  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-teal px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-dark">
          
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add breed
        </button>
      </div>

      <DataTable
        rows={rows}
        columns={columns}
        loading={loading}
        error={error}
        searchFields={(row) => `${row.name} ${row.description ?? ''}`}
        searchPlaceholder="Search breeds"
        emptyTitle="No breeds yet"
        emptyDescription="Add your first breed so visitors can see what is available."
        onEdit={openEdit}
        onDelete={setDeleting} />
      

      <FormDrawer
        open={open}
        title={editing ? 'Edit breed' : 'Add breed'}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
        saving={saving}
        submitLabel={editing ? 'Save changes' : 'Add breed'}>
        
        <ImageUploadField label="Photo" value={form.image_url} onChange={set('image_url')} folder="rabbit-farm" />
        <TextField label="Breed name" value={form.name} onChange={set('name')} required error={nameError} />
        <TextAreaField label="Description" value={form.description} onChange={set('description')} rows={4} />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Price" value={form.price} onChange={set('price')} placeholder="e.g. ₦15,000 per kit" />
          <SelectField label="Availability" value={form.availability} onChange={set('availability')} options={AVAILABILITY} />
        </div>
        <TextField
          label="Display order"
          value={form.display_order}
          onChange={set('display_order')}
          type="number"
          hint="Lowest shows first" />
        
      </FormDrawer>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this breed?"
        description="It will be removed from the Rabbit Farm page immediately."
        busy={saving}
        onCancel={() => setDeleting(null)}
        onConfirm={async () => {
          if (deleting) await remove(deleting.id);
          setDeleting(null);
        }} />
      
    </div>);

}

/* ------------------------------- Gallery --------------------------------- */

interface GalleryForm {
  image_url: string;
  title: string;
  album: string;
  display_order: string;
}

const EMPTY_IMAGE: GalleryForm = { image_url: '', title: '', album: '', display_order: '0' };

function GalleryPanel() {
  const { rows, loading, error, saving, create, update, remove } = useCrud<RabbitGalleryImage>(
    'rabbit_gallery',
    { column: 'display_order', ascending: true },
    'Image'
  );
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<RabbitGalleryImage | null>(null);
  const [form, setForm] = useState<GalleryForm>(EMPTY_IMAGE);
  const [imageError, setImageError] = useState<string | undefined>();
  const [deleting, setDeleting] = useState<RabbitGalleryImage | null>(null);

  const set = (field: keyof GalleryForm) => (value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY_IMAGE, display_order: String(rows.length) });
    setImageError(undefined);
    setOpen(true);
  };

  const openEdit = (image: RabbitGalleryImage) => {
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

  const columns: Column<RabbitGalleryImage>[] = [
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
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-teal px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-dark">
          
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add image
        </button>
      </div>

      <DataTable
        rows={rows}
        columns={columns}
        loading={loading}
        error={error}
        searchFields={(row) => `${row.title ?? ''} ${row.album ?? ''}`}
        searchPlaceholder="Search farm photos"
        emptyTitle="No farm photos yet"
        emptyDescription="Upload photos of the hutches, litters and the team."
        onEdit={openEdit}
        onDelete={setDeleting} />
      

      <FormDrawer
        open={open}
        title={editing ? 'Edit image' : 'Add image'}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
        saving={saving}
        submitLabel={editing ? 'Save changes' : 'Add image'}>
        
        <ImageUploadField
          label="Image"
          value={form.image_url}
          onChange={set('image_url')}
          folder="rabbit-farm"
          error={imageError} />
        
        <TextField label="Title / caption" value={form.title} onChange={set('title')} />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Album" value={form.album} onChange={set('album')} placeholder="e.g. Hutches" />
          <TextField
            label="Display order"
            value={form.display_order}
            onChange={set('display_order')}
            type="number"
            hint="Lowest shows first" />
          
        </div>
      </FormDrawer>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this image?"
        description="It will be removed from the farm gallery immediately."
        busy={saving}
        onCancel={() => setDeleting(null)}
        onConfirm={async () => {
          if (deleting) await remove(deleting.id);
          setDeleting(null);
        }} />
      
    </div>);

}

/* -------------------------------- Posts ---------------------------------- */

interface PostForm {
  title: string;
  slug: string;
  cover_image_url: string;
  excerpt: string;
  body: string;
  status: string;
  published_at: string;
}

const EMPTY_POST: PostForm = {
  title: '',
  slug: '',
  cover_image_url: '',
  excerpt: '',
  body: '',
  status: 'draft',
  published_at: ''
};

const STATUSES = [
{ value: 'draft', label: 'Draft' },
{ value: 'published', label: 'Published' }];


function PostsPanel() {
  const { rows, loading, error, saving, create, update, remove } = useCrud<RabbitPost>(
    'rabbit_posts',
    { column: 'created_at', ascending: false },
    'Post'
  );
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<RabbitPost | null>(null);
  const [form, setForm] = useState<PostForm>(EMPTY_POST);
  const [titleError, setTitleError] = useState<string | undefined>();
  const [deleting, setDeleting] = useState<RabbitPost | null>(null);

  const set = (field: keyof PostForm) => (value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_POST);
    setTitleError(undefined);
    setOpen(true);
  };

  const openEdit = (post: RabbitPost) => {
    setEditing(post);
    setForm({
      title: post.title,
      slug: post.slug,
      cover_image_url: post.cover_image_url ?? '',
      excerpt: post.excerpt ?? '',
      body: post.body ?? '',
      status: post.status ?? 'draft',
      published_at: post.published_at ? post.published_at.slice(0, 10) : ''
    });
    setTitleError(undefined);
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      setTitleError('Please add a title.');
      return;
    }
    const slug = form.slug.trim() || slugify(form.title);
    const payload = {
      title: form.title.trim(),
      slug,
      cover_image_url: form.cover_image_url || null,
      excerpt: form.excerpt.trim() || null,
      body: form.body.trim() || null,
      status: form.status,
      published_at:
      form.status === 'published' ?
      form.published_at ? new Date(form.published_at).toISOString() : new Date().toISOString() :
      null
    };
    const success = editing ? await update(editing.id, payload) : await create(payload);
    if (success) setOpen(false);
  };

  const columns: Column<RabbitPost>[] = [
  {
    key: 'title',
    header: 'Title',
    sortValue: (row) => row.title,
    render: (row) => <span className="font-medium text-ink">{row.title}</span>
  },
  {
    key: 'status',
    header: 'Status',
    sortValue: (row) => row.status,
    render: (row) =>
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${
      row.status === 'published' ? 'bg-teal/10 text-teal-dark' : 'bg-ink/[0.06] text-subtle'}`
      }>
      
          {row.status === 'published' ? 'Published' : 'Draft'}
        </span>

  },
  {
    key: 'published_at',
    header: 'Published',
    sortValue: (row) => row.published_at ?? '',
    render: (row) => formatDate(row.published_at, 'MMM d, yyyy') || '—'
  }];


  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-teal px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-dark">
          
          <Plus className="h-4 w-4" aria-hidden="true" />
          New post
        </button>
      </div>

      <DataTable
        rows={rows}
        columns={columns}
        loading={loading}
        error={error}
        searchFields={(row) => `${row.title} ${row.excerpt ?? ''}`}
        searchPlaceholder="Search journal posts"
        emptyTitle="No journal posts yet"
        emptyDescription="Write your first entry from the farm."
        onEdit={openEdit}
        onDelete={setDeleting} />
      

      <FormDrawer
        open={open}
        title={editing ? 'Edit post' : 'New post'}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
        saving={saving}
        submitLabel={editing ? 'Save changes' : 'Create post'}>
        
        <TextField label="Title" value={form.title} onChange={set('title')} required error={titleError} />
        <TextField
          label="Slug"
          value={form.slug}
          onChange={set('slug')}
          hint="Leave blank to generate it from the title." />
        
        <ImageUploadField
          label="Cover image"
          value={form.cover_image_url}
          onChange={set('cover_image_url')}
          folder="rabbit-farm" />
        
        <TextAreaField label="Excerpt" value={form.excerpt} onChange={set('excerpt')} rows={3} />
        <TextAreaField label="Body" value={form.body} onChange={set('body')} rows={12} />
        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField label="Status" value={form.status} onChange={set('status')} options={STATUSES} />
          <TextField
            label="Publish date"
            value={form.published_at}
            onChange={set('published_at')}
            type="date"
            hint="Defaults to today when published." />
          
        </div>
      </FormDrawer>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this post?"
        description="This cannot be undone."
        busy={saving}
        onCancel={() => setDeleting(null)}
        onConfirm={async () => {
          if (deleting) await remove(deleting.id);
          setDeleting(null);
        }} />
      
    </div>);

}

/* ------------------------------ Enquiries -------------------------------- */

function EnquiriesPanel() {
  const { rows, loading, error, saving, update, remove } = useCrud<RabbitEnquiry>(
    'rabbit_enquiries',
    { column: 'created_at', ascending: false },
    'Enquiry'
  );
  const [deleting, setDeleting] = useState<RabbitEnquiry | null>(null);
  const [reading, setReading] = useState<RabbitEnquiry | null>(null);

  const columns: Column<RabbitEnquiry>[] = [
  {
    key: 'name',
    header: 'From',
    sortValue: (row) => row.name,
    render: (row) =>
    <div>
          <p className={`text-ink ${row.is_read ? '' : 'font-semibold'}`}>{row.name}</p>
          <p className="text-xs text-subtle">{row.email}</p>
        </div>

  },
  { key: 'phone', header: 'Phone', render: (row) => row.phone ?? '—' },
  { key: 'interest', header: 'Interest', sortValue: (row) => row.interest ?? '', render: (row) => row.interest ?? '—' },
  {
    key: 'message',
    header: 'Message',
    render: (row) =>
    <button
      type="button"
      onClick={() => setReading(row)}
      className="max-w-xs truncate text-left text-teal underline">
      
          {row.message}
        </button>

  },
  {
    key: 'created_at',
    header: 'Received',
    sortValue: (row) => row.created_at,
    render: (row) => formatDate(row.created_at, 'MMM d, yyyy')
  }];


  return (
    <div>
      <DataTable
        rows={rows}
        columns={columns}
        loading={loading}
        error={error}
        searchFields={(row) => `${row.name} ${row.email} ${row.interest ?? ''} ${row.message}`}
        searchPlaceholder="Search enquiries"
        emptyTitle="No enquiries yet"
        emptyDescription="Messages sent from the Rabbit Farm page will land here."
        onDelete={setDeleting}
        rowActions={(row) =>
        row.is_read ?
        <span className="text-xs text-subtle">Read</span> :

        <button
          type="button"
          onClick={() => update(row.id, { is_read: true })}
          className="inline-flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-xs text-subtle transition-colors hover:border-teal hover:text-teal">
          
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
              Mark read
            </button>

        } />
      

      {reading &&
      <div
        className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/50 p-4"
        role="dialog"
        aria-modal="true"
        onClick={() => setReading(null)}>
        
          <div className="w-full max-w-lg rounded-xl bg-white p-6" onClick={(event) => event.stopPropagation()}>
            <h2 className="font-heading text-xl text-ink">{reading.name}</h2>
            <p className="mt-1 text-sm text-subtle">
              {reading.email}
              {reading.phone ? ` · ${reading.phone}` : ''}
              {reading.interest ? ` · ${reading.interest}` : ''}
            </p>
            <p className="mt-5 whitespace-pre-line text-sm leading-relaxed text-ink">{reading.message}</p>
            <div className="mt-6 flex justify-end gap-2">
              <a
              href={`mailto:${reading.email}`}
              className="rounded-lg bg-teal px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-dark">
              
                Reply by email
              </a>
              <button
              type="button"
              onClick={() => setReading(null)}
              className="rounded-lg border border-line px-4 py-2 text-sm text-ink transition-colors hover:border-teal hover:text-teal">
              
                Close
              </button>
            </div>
          </div>
        </div>
      }

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this enquiry?"
        description="This cannot be undone."
        busy={saving}
        onCancel={() => setDeleting(null)}
        onConfirm={async () => {
          if (deleting) await remove(deleting.id);
          setDeleting(null);
        }} />
      
    </div>);

}
