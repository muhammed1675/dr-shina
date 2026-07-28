import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { supabase, isSupabaseConfigured } from './supabase';
import { useSupabaseQuery } from './useSupabaseQuery';

interface Order {
  column: string;
  ascending?: boolean;
}

interface CrudResult<T> {
  rows: T[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  saving: boolean;
  create: (values: Record<string, unknown>) => Promise<boolean>;
  update: (id: string, values: Record<string, unknown>) => Promise<boolean>;
  remove: (id: string) => Promise<boolean>;
}

/** Live table access for the admin dashboard: real reads, inserts, updates and deletes. */
export function useCrud<T extends {id: string;}>(
table: string,
order: Order,
label = 'Record')
: CrudResult<T> {
  const { data, loading, error, refetch } = useSupabaseQuery<T>(
    () => supabase.from(table).select('*').order(order.column, { ascending: order.ascending ?? false, nullsFirst: false }),
    [table, order.column, order.ascending]
  );
  const [saving, setSaving] = useState(false);

  const guard = useCallback(() => {
    if (!isSupabaseConfigured) {
      toast.error('Supabase is not connected. Add your keys to .env.local.');
      return false;
    }
    return true;
  }, []);

  const create = useCallback(
    async (values: Record<string, unknown>) => {
      if (!guard()) return false;
      setSaving(true);
      const { error: insertError } = await supabase.from(table).insert(values);
      setSaving(false);
      if (insertError) {
        toast.error(insertError.message);
        return false;
      }
      toast.success(`${label} created`);
      refetch();
      return true;
    },
    [guard, table, label, refetch]
  );

  const update = useCallback(
    async (id: string, values: Record<string, unknown>) => {
      if (!guard()) return false;
      setSaving(true);
      const { error: updateError } = await supabase.from(table).update(values).eq('id', id);
      setSaving(false);
      if (updateError) {
        toast.error(updateError.message);
        return false;
      }
      toast.success(`${label} updated`);
      refetch();
      return true;
    },
    [guard, table, label, refetch]
  );

  const remove = useCallback(
    async (id: string) => {
      if (!guard()) return false;
      setSaving(true);
      const { error: deleteError } = await supabase.from(table).delete().eq('id', id);
      setSaving(false);
      if (deleteError) {
        toast.error(deleteError.message);
        return false;
      }
      toast.success(`${label} deleted`);
      refetch();
      return true;
    },
    [guard, table, label, refetch]
  );

  return { rows: data, loading, error, refetch, saving, create, update, remove };
}