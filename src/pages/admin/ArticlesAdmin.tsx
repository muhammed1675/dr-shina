import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { AdminPageHeader } from '../../components/admin/AdminLayout';
import { Column, DataTable } from '../../components/admin/DataTable';
import { ConfirmDialog, FormDrawer, ImageUploadField, SelectField, TextAreaField, TextField } from '../../components/admin/fields';
import { useCrud } from '../../lib/useCrud';
import { Article } from '../../lib/types';
import { estimateReadingTime, formatDate, parseList, slugify } from '../../lib/format';

interface FormState {
  title: string;
  slug: string;
  cover_image_url: string;
  category: string;
  tags: string;
  excerpt: string;
  body: string;
  reading_time: string;
  status: string;
  published_at: string;
}

const EMPTY: FormState = {
  title: '',
  slug: '',
  cover_image_url: '',
  category: '',
  tags: '',
  excerpt: '',
  body: '',
  reading_time: '',
  status: 'draft',
  published_at: ''
};

export function ArticlesAdmin() {
  const { rows, loading, error, saving, create, update, remove } = useCrud<Article>('articles', { column: 'created_at' }, 'Article');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Article | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [deleting, setDeleting] = useState<Article | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const set = (field: keyof FormState) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setErrors({});
    setOpen(true);
  };

  const openEdit = (article: Article) => {
    setEditing(article);
    setForm({
      title: article.title,
      slug: article.slug,
      cover_image_url: article.cover_image_url ?? '',
      category: article.category ?? '',
      tags: (article.tags ?? []).join(', '),
      excerpt: article.excerpt ?? '',
      body: article.body ?? '',
      reading_time: article.reading_time ? String(article.reading_time) : '',
      status: article.status ?? 'draft',
      published_at: article.published_at ? article.published_at.slice(0, 10) : ''
    });
    setErrors({});
    setOpen(true);
  };

  const handleSubmit = async () => {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};
    if (!form.title.trim()) nextErrors.title = 'A title is required.';
    const slug = form.slug.trim() || slugify(form.title);
    if (!slug) nextErrors.slug = 'A slug is required.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload = {
      title: form.title.trim(),
      slug,
      cover_image_url: form.cover_image_url || null,
      category: form.category.trim() || null,
      tags: form.tags.trim() ? parseList(form.tags) : null,
      excerpt: form.excerpt.trim() || null,
      body: form.body || null,
      reading_time: form.reading_time ? Number(form.reading_time) : estimateReadingTime(form.body),
      status: form.status,
      published_at:
      form.status === 'published' ?
      form.published_at ?
      new Date(form.published_at).toISOString() :
      new Date().toISOString() :
      form.published_at ?
      new Date(form.published_at).toISOString() :
      null
    };

    const success = editing ? await update(editing.id, payload) : await create(payload);
    if (success) setOpen(false);
  };

  const columns: Column<Article>[] = [
  {
    key: 'title',
    header: 'Title',
    sortValue: (row) => row.title.toLowerCase(),
    render: (row) =>
    <div className="flex items-center gap-3">
          {row.cover_image_url ?
      <img src={row.cover_image_url} alt="" className="h-10 w-14 shrink-0 rounded object-cover" /> :

      <span className="h-10 w-14 shrink-0 rounded bg-black/[0.05]" />
      }
          <span>
            <span className="block font-medium text-ink">{row.title}</span>
            <span className="block text-xs text-subtle">/{row.slug}</span>
          </span>
        </div>

  },
  { key: 'category', header: 'Category', sortValue: (row) => row.category ?? '', render: (row) => row.category ?? '—' },
  {
    key: 'status',
    header: 'Status',
    sortValue: (row) => row.status,
    render: (row) =>
    <span
      className={`rounded-full px-2.5 py-1 text-xs capitalize ${
      row.status === 'published' ? 'bg-success/10 text-success' : 'bg-black/[0.05] text-subtle'}`
      }>
      
          {row.status}
        </span>

  },
  {
    key: 'reading_time',
    header: 'Read',
    sortValue: (row) => row.reading_time ?? 0,
    render: (row) => `${row.reading_time ?? estimateReadingTime(row.body)} min`
  },
  {
    key: 'published_at',
    header: 'Published',
    sortValue: (row) => row.published_at ?? '',
    render: (row) => formatDate(row.published_at, 'MMM d, yyyy') || '—'
  }];


  const filteredRows = statusFilter === 'all' ? rows : rows.filter((row) => row.status === statusFilter);

  return (
    <div>
      <AdminPageHeader
        title="Articles"
        description="Write, edit and publish long-form pieces."
        action={
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-teal px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-dark">
          
            <Plus className="h-4 w-4" aria-hidden="true" />
            New article
          </button>
        } />
      

      <DataTable
        rows={filteredRows}
        columns={columns}
        loading={loading}
        error={error}
        searchFields={(row) => `${row.title} ${row.slug} ${row.category ?? ''} ${(row.tags ?? []).join(' ')}`}
        searchPlaceholder="Search articles"
        emptyTitle="No articles yet"
        emptyDescription="Create your first article to see it here."
        onEdit={openEdit}
        onDelete={setDeleting}
        filters={
        <div className="flex items-center gap-1 rounded-lg border border-line p-1">
            {['all', 'published', 'draft'].map((value) =>
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
        title={editing ? 'Edit article' : 'New article'}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
        saving={saving}
        submitLabel={editing ? 'Save changes' : 'Create article'}>
        
        <TextField label="Title" required value={form.title} onChange={set('title')} error={errors.title} />
        <TextField
          label="Slug"
          required
          value={form.slug}
          onChange={set('slug')}
          error={errors.slug}
          hint={`Leave blank to generate: /${slugify(form.title) || 'article-slug'}`} />
        
        <ImageUploadField label="Cover image" value={form.cover_image_url} onChange={set('cover_image_url')} folder="articles" />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Category" value={form.category} onChange={set('category')} placeholder="e.g. Public Health" />
          <TextField label="Tags" value={form.tags} onChange={set('tags')} hint="Comma separated" />
        </div>
        <TextAreaField label="Excerpt" value={form.excerpt} onChange={set('excerpt')} rows={3} />
        <TextAreaField
          label="Body"
          value={form.body}
          onChange={set('body')}
          rows={14}
          mono
          hint="Rich text: use HTML (<h2>, <p>, <blockquote>, <ul>) or plain paragraphs separated by blank lines." />
        
        <div className="grid gap-5 sm:grid-cols-3">
          <TextField
            label="Reading time"
            value={form.reading_time}
            onChange={set('reading_time')}
            type="number"
            hint={`Auto: ${estimateReadingTime(form.body)} min`} />
          
          <SelectField
            label="Status"
            value={form.status}
            onChange={set('status')}
            options={[
            { value: 'draft', label: 'Draft' },
            { value: 'published', label: 'Published' }]
            } />
          
          <TextField label="Published date" value={form.published_at} onChange={set('published_at')} type="date" />
        </div>
      </FormDrawer>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this article?"
        description={deleting ? `“${deleting.title}” will be permanently removed.` : undefined}
        busy={saving}
        onCancel={() => setDeleting(null)}
        onConfirm={async () => {
          if (deleting) await remove(deleting.id);
          setDeleting(null);
        }} />
      
    </div>);

}