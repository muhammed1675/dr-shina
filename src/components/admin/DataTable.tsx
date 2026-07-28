import React, { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, Loader2, Pencil, Search, Trash2 } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  sortValue?: (row: T) => string | number;
  className?: string;
}

interface DataTableProps<T> {
  rows: T[];
  columns: Column<T>[];
  loading?: boolean;
  error?: string | null;
  searchFields: (row: T) => string;
  searchPlaceholder?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  filters?: React.ReactNode;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  rowActions?: (row: T) => React.ReactNode;
}

export function DataTable<T extends {id: string;}>({
  rows,
  columns,
  loading = false,
  error = null,
  searchFields,
  searchPlaceholder = 'Search',
  emptyTitle = 'Nothing here yet',
  emptyDescription,
  filters,
  onEdit,
  onDelete,
  rowActions
}: DataTableProps<T>) {
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [ascending, setAscending] = useState(true);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    let result = term ? rows.filter((row) => searchFields(row).toLowerCase().includes(term)) : [...rows];

    if (sortKey) {
      const column = columns.find((item) => item.key === sortKey);
      if (column?.sortValue) {
        result.sort((a, b) => {
          const left = column.sortValue!(a);
          const right = column.sortValue!(b);
          if (typeof left === 'number' && typeof right === 'number') return ascending ? left - right : right - left;
          return ascending ?
          String(left).localeCompare(String(right)) :
          String(right).localeCompare(String(left));
        });
      }
    }
    return result;
  }, [rows, query, sortKey, ascending, columns, searchFields]);

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setAscending((value) => !value);
    } else {
      setSortKey(key);
      setAscending(true);
    }
  };

  return (
    <div className="rounded-xl border border-line bg-white">
      <div className="flex flex-col gap-4 border-b border-line p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-subtle" aria-hidden="true" />
          <label className="sr-only" htmlFor="table-search">
            {searchPlaceholder}
          </label>
          <input
            id="table-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
            className="h-10 w-full rounded-lg border border-line pl-9 pr-3 text-sm outline-none transition-colors focus:border-teal" />
          
        </div>
        {filters && <div className="flex flex-wrap items-center gap-2">{filters}</div>}
      </div>

      {loading ?
      <div className="flex items-center justify-center gap-3 py-20 text-sm text-subtle">
          <Loader2 className="h-4 w-4 animate-spin text-teal" aria-hidden="true" />
          Loading records…
        </div> :
      error ?
      <p role="alert" className="px-6 py-16 text-center text-sm text-destructive">
          {error}
        </p> :
      visible.length === 0 ?
      <div className="px-6 py-16 text-center">
          <p className="font-heading text-lg text-ink">{emptyTitle}</p>
          {emptyDescription && <p className="mt-2 text-sm text-subtle">{emptyDescription}</p>}
        </div> :

      <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-line bg-black/[0.015] text-xs uppercase tracking-[0.1em] text-subtle">
                {columns.map((column) =>
              <th key={column.key} scope="col" className={`px-4 py-3 font-medium ${column.className ?? ''}`}>
                    {column.sortValue ?
                <button
                  type="button"
                  onClick={() => toggleSort(column.key)}
                  className="inline-flex items-center gap-1.5 transition-colors hover:text-ink"
                  aria-label={`Sort by ${column.header}`}>
                  
                        {column.header}
                        {sortKey === column.key && (
                  ascending ? <ArrowUp className="h-3 w-3" aria-hidden="true" /> : <ArrowDown className="h-3 w-3" aria-hidden="true" />)}
                      </button> :

                column.header
                }
                  </th>
              )}
                {(onEdit || onDelete || rowActions) &&
              <th scope="col" className="px-4 py-3 text-right font-medium">
                    Actions
                  </th>
              }
              </tr>
            </thead>
            <tbody>
              {visible.map((row) =>
            <tr key={row.id} className="border-b border-line/70 last:border-0 hover:bg-black/[0.015]">
                  {columns.map((column) =>
              <td key={column.key} className={`px-4 py-3 align-middle ${column.className ?? ''}`}>
                      {column.render ? column.render(row) : String((row as Record<string, unknown>)[column.key] ?? '—')}
                    </td>
              )}
                  {(onEdit || onDelete || rowActions) &&
              <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {rowActions?.(row)}
                        {onEdit &&
                  <button
                    type="button"
                    onClick={() => onEdit(row)}
                    aria-label="Edit"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-subtle transition-colors hover:border-teal hover:text-teal">
                    
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                  }
                        {onDelete &&
                  <button
                    type="button"
                    onClick={() => onDelete(row)}
                    aria-label="Delete"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-subtle transition-colors hover:border-destructive hover:text-destructive">
                    
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                  }
                      </div>
                    </td>
              }
                </tr>
            )}
            </tbody>
          </table>
        </div>
      }
    </div>);

}