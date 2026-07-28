import React, { useState } from 'react';
import { toast } from 'sonner';
import { Mail, MailOpen } from 'lucide-react';
import { AdminPageHeader } from '../../components/admin/AdminLayout';
import { Column, DataTable } from '../../components/admin/DataTable';
import { ConfirmDialog } from '../../components/admin/fields';
import { useCrud } from '../../lib/useCrud';
import { ContactMessage } from '../../lib/types';
import { formatDate } from '../../lib/format';

export function MessagesAdmin() {
  const { rows, loading, error, saving, update, remove } = useCrud<ContactMessage>(
    'contact_messages',
    { column: 'created_at' },
    'Message'
  );
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [deleting, setDeleting] = useState<ContactMessage | null>(null);

  const openMessage = async (message: ContactMessage) => {
    setSelected(message);
    if (!message.is_read) await update(message.id, { is_read: true });
  };

  const columns: Column<ContactMessage>[] = [
  {
    key: 'name',
    header: 'From',
    sortValue: (row) => row.name.toLowerCase(),
    render: (row) =>
    <span>
          <span className={`block ${row.is_read ? 'text-ink' : 'font-semibold text-ink'}`}>{row.name}</span>
          <span className="block text-xs text-subtle">{row.email}</span>
        </span>

  },
  {
    key: 'subject',
    header: 'Subject',
    sortValue: (row) => row.subject ?? '',
    render: (row) => row.subject ?? '—'
  },
  {
    key: 'message',
    header: 'Message',
    render: (row) => <span className="line-clamp-1 block max-w-sm text-subtle">{row.message}</span>
  },
  {
    key: 'created_at',
    header: 'Received',
    sortValue: (row) => row.created_at,
    render: (row) => formatDate(row.created_at, 'MMM d, yyyy')
  },
  {
    key: 'is_read',
    header: 'Status',
    sortValue: (row) => row.is_read ? 1 : 0,
    render: (row) =>
    <span
      className={`rounded-full px-2.5 py-1 text-xs ${row.is_read ? 'bg-black/[0.05] text-subtle' : 'bg-teal/10 text-teal-dark'}`}>
      
          {row.is_read ? 'Read' : 'Unread'}
        </span>

  }];


  const filteredRows =
  filter === 'all' ? rows : filter === 'unread' ? rows.filter((row) => !row.is_read) : rows.filter((row) => row.is_read);

  return (
    <div>
      <AdminPageHeader title="Contact messages" description="Enquiries submitted through the contact form." />

      <DataTable
        rows={filteredRows}
        columns={columns}
        loading={loading}
        error={error}
        searchFields={(row) => `${row.name} ${row.email} ${row.subject ?? ''} ${row.message}`}
        searchPlaceholder="Search messages"
        emptyTitle="No messages yet"
        emptyDescription="Submissions from the contact form will land here."
        onDelete={setDeleting}
        rowActions={(row) =>
        <>
            <button
            type="button"
            onClick={() => openMessage(row)}
            className="rounded-lg border border-line px-3 py-1.5 text-xs text-ink transition-colors hover:border-teal hover:text-teal">
            
              Read
            </button>
            <button
            type="button"
            onClick={async () => {
              await update(row.id, { is_read: !row.is_read });
              toast.success(row.is_read ? 'Marked as unread' : 'Marked as read');
            }}
            aria-label={row.is_read ? 'Mark as unread' : 'Mark as read'}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-subtle transition-colors hover:border-teal hover:text-teal">
            
              {row.is_read ? <Mail className="h-3.5 w-3.5" /> : <MailOpen className="h-3.5 w-3.5" />}
            </button>
          </>
        }
        filters={
        <div className="flex items-center gap-1 rounded-lg border border-line p-1">
            {['all', 'unread', 'read'].map((value) =>
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={`rounded-md px-3 py-1.5 text-xs capitalize transition-colors ${
            filter === value ? 'bg-ink text-white' : 'text-subtle hover:text-ink'}`
            }>
            
                {value}
              </button>
          )}
          </div>
        } />
      

      {selected &&
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4"
        onClick={() => setSelected(null)}
        role="presentation">
        
          <div
          role="dialog"
          aria-modal="true"
          aria-label={`Message from ${selected.name}`}
          onClick={(event) => event.stopPropagation()}
          className="w-full max-w-lg rounded-xl border border-line bg-white p-7">
          
            <p className="text-xs uppercase tracking-[0.2em] text-subtle">{formatDate(selected.created_at, 'MMMM d, yyyy')}</p>
            <h2 className="mt-3 font-heading text-2xl text-ink">{selected.subject ?? 'No subject'}</h2>
            <p className="mt-1 text-sm text-subtle">
              {selected.name} ·{' '}
              <a href={`mailto:${selected.email}`} className="text-teal underline">
                {selected.email}
              </a>
            </p>
            <p className="mt-6 whitespace-pre-wrap text-sm leading-relaxed text-ink">{selected.message}</p>
            <div className="mt-8 flex justify-end gap-3">
              <button
              type="button"
              onClick={() => setSelected(null)}
              className="rounded-lg border border-line px-5 py-2.5 text-sm text-ink transition-colors hover:border-subtle">
              
                Close
              </button>
              <a
              href={`mailto:${selected.email}`}
              className="rounded-lg bg-teal px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-dark">
              
                Reply by email
              </a>
            </div>
          </div>
        </div>
      }

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete this message?"
        description={deleting ? `The enquiry from ${deleting.name} will be permanently removed.` : undefined}
        busy={saving}
        onCancel={() => setDeleting(null)}
        onConfirm={async () => {
          if (deleting) await remove(deleting.id);
          setDeleting(null);
        }} />
      
    </div>);

}