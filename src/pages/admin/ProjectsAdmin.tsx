import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { AdminPageHeader } from '../../components/admin/AdminLayout';
import { Column, DataTable } from '../../components/admin/DataTable';
import {
  ConfirmDialog,
  FormDrawer,
  ImageUploadField,
  KeyValueField,
  SelectField,
  TextAreaField,
  TextField } from
'../../components/admin/fields';
import { useCrud } from '../../lib/useCrud';
import { ImpactStat, Project } from '../../lib/types';
import { formatDate, parseList } from '../../lib/format';

interface FormState {
  title: string;
  cover_image_url: string;
  description: string;
  impact_stats: ImpactStat[];
  partners: string;
  status: string;
}

const EMPTY: FormState = {
  title: '',
  cover_image_url: '',
  description: '',
  impact_stats: [{ label: '', value: '' }],
  partners: '',
  status: 'active'
};

export function ProjectsAdmin() {
  const { rows, loading, error, saving, create, update, remove } = useCrud<Project>('projects', { column: 'created_at' }, 'Project');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [titleError, setTitleError] = useState<string | undefined>();
  const [deleting, setDeleting] = useState<Project | null>(null);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setTitleError(undefined);
    setOpen(true);
  };

  const openEdit = (project: Project) => {
    setEditing(project);
    setForm({
      title: project.title,
      cover_image_url: project.cover_image_url ?? '',
      description: project.description ?? '',
      impact_stats: Array.isArray(project.impact_stats) && project.impact_stats.length > 0 ? project.impact_stats : [{ label: '', value: '' }],
      partners: (project.partners ?? []).join(', '),
      status: project.status ?? 'active'
    });
    setTitleError(undefined);
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      setTitleError('A project title is required.');
      return;
    }
    const stats = form.impact_stats.filter((stat) => stat.label.trim() && stat.value.trim());
    const payload = {
      title: form.title.trim(),
      cover_image_url: form.cover_image_url || null,
      description: form.description.trim() || null,
      impact_stats: stats.length > 0 ? stats : null,
      partners: form.partners.trim() ? parseList(form.partners) : null,
      status: form.status
    };
    const success = editing ? await update(editing.id, payload) : await create(payload);
    if (success) setOpen(false);
  };

  const columns: Column<Project>[] = [
  {
    key: 'title',
    header: 'Project',
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
    key: 'impact_stats',
    header: 'Impact stats',
    render: (row) => (Array.isArray(row.impact_stats) ? row.impact_stats.length : 0) + ' stat(s)'
  },
  {
    key: 'partners',
    header: 'Partners',
    render: (row) => (row.partners ?? []).join(', ') || '—'
  },
  {
    key: 'status',
    header: 'Status',
    sortValue: (row) => row.status ?? '',
    render: (row) =>
    <span
      className={`rounded-full px-2.5 py-1 text-xs capitalize ${
      row.status === 'active' ? 'bg-teal/10 text-teal-dark' : 'bg-black/[0.05] text-subtle'}`
      }>
      
          {row.status}
        </span>

  },
  {
    key: 'created_at',
    header: 'Created',
    sortValue: (row) => row.created_at ?? '',
    render: (row) => formatDate(row.created_at ?? null, 'MMM d, yyyy')
  }];


  return (
    <div>
      <AdminPageHeader
        title="Projects"
        description="Community initiatives with their impact numbers and partners."
        action={
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-lg bg-teal px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-dark">
          
            <Plus className="h-4 w-4" aria-hidden="true" />
            New project
          </button>
        } />
      

      <DataTable
        rows={rows}
        columns={columns}
        loading={loading}
        error={error}
        searchFields={(row) => `${row.title} ${row.description ?? ''} ${(row.partners ?? []).join(' ')}`}
        searchPlaceholder="Search projects"
        emptyTitle="No projects yet"
        emptyDescription="Add a project to showcase it on the site."
        onEdit={openEdit}
        onDelete={setDeleting} />
      

      <FormDrawer
        open={open}
        title={editing ? 'Edit project' : 'New project'}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
        saving={saving}
        submitLabel={editing ? 'Save changes' : 'Create project'}>
        
        <TextField
          label="Title"
          required
          value={form.title}
          onChange={(value) => {
            setForm((prev) => ({ ...prev, title: value }));
            setTitleError(undefined);
          }}
          error={titleError} />
        
        <ImageUploadField
          label="Cover image"
          value={form.cover_image_url}
          onChange={(value) => setForm((prev) => ({ ...prev, cover_image_url: value }))}
          folder="projects" />
        
        <TextAreaField
          label="Description"
          value={form.description}
          onChange={(value) => setForm((prev) => ({ ...prev, description: value }))}
          rows={5} />
        
        <KeyValueField
          label="Impact stats"
          items={form.impact_stats}
          onChange={(items) => setForm((prev) => ({ ...prev, impact_stats: items }))} />
        
        <TextField
          label="Partner logos / names"
          value={form.partners}
          onChange={(value) => setForm((prev) => ({ ...prev, partners: value }))}
          hint="Comma separated partner names" />
        
        <SelectField
          label="Status"
          value={form.status}
          onChange={(value) => setForm((prev) => ({ ...prev, status: value }))}
          options={[
          { value: 'active', label: 'Active' },
          { value: 'completed', label: 'Completed' }]
          } />
        
      </FormDrawer>

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this project?"
        description={deleting ? `“${deleting.title}” will be permanently removed.` : undefined}
        busy={saving}
        onCancel={() => setDeleting(null)}
        onConfirm={async () => {
          if (deleting) await remove(deleting.id);
          setDeleting(null);
        }} />
      
    </div>);

}