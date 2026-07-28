import React from 'react';
import { Download } from 'lucide-react';
import { toast } from 'sonner';
import { AdminPageHeader } from '../../components/admin/AdminLayout';
import { Column, DataTable } from '../../components/admin/DataTable';
import { useSupabaseQuery } from '../../lib/useSupabaseQuery';
import { supabase } from '../../lib/supabase';
import { NewsletterSubscriber } from '../../lib/types';
import { downloadCsv, formatDate, toCsv } from '../../lib/format';

export function SubscribersAdmin() {
  const { data, loading, error } = useSupabaseQuery<NewsletterSubscriber>(
    () => supabase.from('newsletter_subscribers').select('*').order('created_at', { ascending: false }),
    []
  );

  const columns: Column<NewsletterSubscriber>[] = [
  {
    key: 'email',
    header: 'Email',
    sortValue: (row) => row.email.toLowerCase(),
    render: (row) => <span className="font-medium text-ink">{row.email}</span>
  },
  {
    key: 'created_at',
    header: 'Subscribed',
    sortValue: (row) => row.created_at,
    render: (row) => formatDate(row.created_at, 'MMM d, yyyy')
  }];


  const handleExport = () => {
    if (data.length === 0) {
      toast.error('There are no subscribers to export yet.');
      return;
    }
    const csv = toCsv(data.map((row) => ({ email: row.email, subscribed_at: row.created_at })));
    downloadCsv(`newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`, csv);
    toast.success(`Exported ${data.length} subscriber${data.length === 1 ? '' : 's'}`);
  };

  return (
    <div>
      <AdminPageHeader
        title="Newsletter subscribers"
        description="Read-only list of everyone who has subscribed."
        action={
        <button
          type="button"
          onClick={handleExport}
          className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-5 py-2.5 text-sm text-ink transition-colors hover:border-teal hover:text-teal">
          
            <Download className="h-4 w-4" aria-hidden="true" />
            Export CSV
          </button>
        } />
      

      <DataTable
        rows={data}
        columns={columns}
        loading={loading}
        error={error}
        searchFields={(row) => row.email}
        searchPlaceholder="Search subscribers"
        emptyTitle="No subscribers yet"
        emptyDescription="Sign-ups from the site’s newsletter forms appear here." />
      
    </div>);

}