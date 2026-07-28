import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { AdminPageHeader } from '../../components/admin/AdminLayout';
import { Column, DataTable } from '../../components/admin/DataTable';
import { ConfirmDialog, FormDrawer, ImageUploadField, TextAreaField, TextField } from '../../components/admin/fields';
import { useCrud } from '../../lib/useCrud';
import { Testimonial } from '../../lib/types';

interface FormState {
  name: string;
  role: string;
  photo_url: string;
  quote: string;
  display_order: string;
}

const EMPTY: FormState = { name: '', role: '', photo_url: '', quote: '', display_order: '0' };

export function TestimonialsAdmin() {
  const { rows, loading, error, saving, create, update, remove } = useCrud<Testimonial>(
    'testimonials',
    { column: 'display_order', ascending: true },
    'Testimonial'
  );
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [deleting, setDeleting] = useState<Testimonial | null>(null);

  const set = (field: keyof FormState) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY, display_order: String(rows.length) });
    setErrors({});
    setOpen(true);
  };

  const openEdit = (testimonial: Testimonial) => {
    setEditing(testimonial);
    setForm({
      name: testimonial.name,
      role: testimonial.role ?? '',
      photo_url: testimonial.photo_url ?? '',
      quote: testimonial.quote,
      display_order: String(testimonial.display_order ?? 0)
    });
    setErrors({});
    setOpen(true);
  };

  const handleSubmit = async () => {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};
    if (!form.name.trim()) nextErrors.name = 'A name is required.';
    if (!form.quote.trim()) nextErrors.quote = 'A quote is required.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload = {
      name: form.name.trim(),
      role: form.role.trim() || null,
      photo_url: form.photo_url || null,
      quote: form.quote.trim(),
      display_order: Number(form.display_order) || 0
    };
    const success = editing ? await update(editing.id, payload) : await create(payload);
    if (success) setOpen(false);
  };

  const columns: Column<Testimonial>[] = [
  {
    key: 'name',
    header: 'Person',
    sortValue: (row) => row.name.toLowerCase(),
    render: (row) =>
    <div className="flex items-center gap-3">
          {row.photo_url ?
      <img src={row.photo_url} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" /> :

      <span className="h-10 w-10 shrink-0 rounded-full bg-black/[0.05]" />
      }
          <span>
            <span className="block font-medium text-ink">{row.name}</span>
            {row.role && <span className="block text-xs text-subtle">{row.role}</span>}
          </span>
        </div>

  },
  {
    key: 'quote',
    header: 'Quote',
    render: (row) => <span className="line-clamp-2 block max-w-md text-subtle">{row.quote}</span>
  },
  { key: 'display_order', header: 'Order', sortValue: (row) => row.display_order ?? 0 }];


  return (
    <div>
      <AdminPageHeader
        title="Testimonials"
        description="Quotes shown on the home and speaking pages."
        action={
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-teal px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-dark">
          
            <Plus className="h-4 w-4" aria-hidden="true" />
            New testimonial
          </button>
        } />
      

      <DataTable
        rows={rows}
        columns={columns}
        loading={loading}
        error={error}
        searchFields={(row) => `${row.name} ${row.role ?? ''} ${row.quote}`}
        searchPlaceholder="Search testimonials"
        emptyTitle="No testimonials yet"
        emptyDescription="Add a quote to build social proof."
        onEdit={openEdit}
        onDelete={setDeleting} />
      

      <FormDrawer
        open={open}
        title={editing ? 'Edit testimonial' : 'New testimonial'}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
        saving={saving}
        submitLabel={editing ? 'Save changes' : 'Create testimonial'}>
        
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField label="Name" required value={form.name} onChange={set('name')} error={errors.name} />
          <TextField label="Role / organisation" value={form.role} onChange={set('role')} />
        </div>
        <ImageUploadField label="Photo" value={form.photo_url} onChange={set('photo_url')} folder="testimonials" />
        <TextAreaField label="Quote" required value={form.quote} onChange={set('quote')} rows={5} error={errors.quote} />
        <TextField label="Display order" value={form.display_order} onChange={set('display_order')} type="number" hint="Lowest shows first" />
      </FormDrawer>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this testimonial?"
        description={deleting ? `The quote from ${deleting.name} will be permanently removed.` : undefined}
        busy={saving}
        onCancel={() => setDeleting(null)}
        onConfirm={async () => {
          if (deleting) await remove(deleting.id);
          setDeleting(null);
        }} />
      
    </div>);

}