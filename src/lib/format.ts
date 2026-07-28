import { format, parseISO } from 'date-fns';

export function formatDate(value?: string | null, pattern = 'MMMM d, yyyy'): string {
  if (!value) return '';
  try {
    const date = value.length <= 10 ? parseISO(value) : new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return format(date, pattern);
  } catch {
    return '';
  }
}

export function estimateReadingTime(body?: string | null): number {
  if (!body) return 1;
  const words = body.replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function slugify(value: string): string {
  return value.
  toLowerCase().
  trim().
  replace(/['"]/g, '').
  replace(/[^a-z0-9]+/g, '-').
  replace(/^-+|-+$/g, '');
}

export function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const escape = (value: unknown) => {
    const text = value === null || value === undefined ? '' : String(value);
    return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  return [headers.join(','), ...rows.map((row) => headers.map((h) => escape(row[h])).join(','))].join('\n');
}

export function downloadCsv(fileName: string, csv: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function parseList(value: string): string[] {
  return value.
  split(',').
  map((item) => item.trim()).
  filter(Boolean);
}