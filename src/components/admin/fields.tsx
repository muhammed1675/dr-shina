import React, { useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, ImagePlus, Loader2, Plus, Trash2, X } from 'lucide-react';
import { uploadMedia } from '../../lib/storage';

const controlClass =
'w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-subtle/60 focus:border-teal';

interface BaseProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
}

export function TextField({
  label,
  value,
  onChange,
  error,
  hint,
  required,
  type = 'text',
  placeholder





}: BaseProps & {value: string;onChange: (value: string) => void;type?: string;placeholder?: string;}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {label} {required && <span className="text-teal">*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={`${controlClass} ${error ? 'border-destructive' : ''}`} />
      
      {hint && !error && <p className="mt-1.5 text-xs text-subtle">{hint}</p>}
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>);

}

export function TextAreaField({
  label,
  value,
  onChange,
  error,
  hint,
  required,
  rows = 4,
  mono = false





}: BaseProps & {value: string;onChange: (value: string) => void;rows?: number;mono?: boolean;}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {label} {required && <span className="text-teal">*</span>}
      </label>
      <textarea
        id={id}
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${controlClass} ${mono ? 'font-mono text-xs leading-relaxed' : ''} ${error ? 'border-destructive' : ''}`} />
      
      {hint && !error && <p className="mt-1.5 text-xs text-subtle">{hint}</p>}
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>);

}

export function SelectField({
  label,
  value,
  onChange,
  options,
  error,
  required




}: BaseProps & {value: string;onChange: (value: string) => void;options: {value: string;label: string;}[];}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
        {label} {required && <span className="text-teal">*</span>}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`${controlClass} ${error ? 'border-destructive' : ''}`}>
        
        {options.map((option) =>
        <option key={option.value} value={option.value}>
            {option.label}
          </option>
        )}
      </select>
      {error && <p className="mt-1.5 text-xs text-destructive">{error}</p>}
    </div>);

}

export function ImageUploadField({
  label,
  value,
  onChange,
  folder = 'uploads',
  error




}: BaseProps & {value: string;onChange: (url: string) => void;folder?: string;}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUploadError('Please choose an image file.');
      return;
    }
    setUploadError(null);
    setUploading(true);
    try {
      const url = await uploadMedia(file, folder);
      onChange(url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          handleFile(event.dataTransfer.files?.[0]);
        }}
        className={`relative flex min-h-[9rem] items-center justify-center overflow-hidden rounded-lg border border-dashed p-4 text-center transition-colors ${
        dragging ? 'border-teal bg-teal/5' : error || uploadError ? 'border-destructive' : 'border-line bg-black/[0.015]'}`
        }>
        
        {value ?
        <div className="relative w-full">
            <img src={value} alt="" className="mx-auto max-h-40 rounded-lg object-contain" />
            <button
            type="button"
            onClick={() => onChange('')}
            aria-label="Remove image"
            className="absolute right-0 top-0 flex h-8 w-8 items-center justify-center rounded-full border border-line bg-white text-subtle transition-colors hover:border-destructive hover:text-destructive">
            
              <X className="h-3.5 w-3.5" />
            </button>
          </div> :

        <div className="text-sm text-subtle">
            {uploading ?
          <span className="flex items-center gap-2 text-teal">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Uploading to storage…
              </span> :

          <>
                <ImagePlus className="mx-auto mb-2 h-6 w-6 text-subtle" aria-hidden="true" />
                Drag & drop an image here, or{' '}
                <button type="button" onClick={() => inputRef.current?.click()} className="font-medium text-teal underline">
                  browse
                </button>
              </>
          }
          </div>
        }
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => handleFile(event.target.files?.[0])} />
        
      </div>
      {value &&
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="mt-2 text-xs font-medium text-teal underline">
        
          Replace image
        </button>
      }
      {(error || uploadError) && <p className="mt-1.5 text-xs text-destructive">{error ?? uploadError}</p>}
    </div>);

}

export function KeyValueField({
  label,
  items,
  onChange




}: {label: string;items: {label: string;value: string;}[];onChange: (items: {label: string;value: string;}[]) => void;}) {
  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      <div className="space-y-3">
        {items.map((item, index) =>
        <div key={index} className="flex gap-2">
            <input
            value={item.label}
            onChange={(event) => {
              const next = [...items];
              next[index] = { ...next[index], label: event.target.value };
              onChange(next);
            }}
            placeholder="Label (e.g. Lives Impacted)"
            className={controlClass} />
          
            <input
            value={item.value}
            onChange={(event) => {
              const next = [...items];
              next[index] = { ...next[index], value: event.target.value };
              onChange(next);
            }}
            placeholder="Value (e.g. 10,000+)"
            className={controlClass} />
          
            <button
            type="button"
            onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}
            aria-label="Remove stat"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-line text-subtle transition-colors hover:border-destructive hover:text-destructive">
            
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={() => onChange([...items, { label: '', value: '' }])}
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-teal">
        
        <Plus className="h-4 w-4" aria-hidden="true" />
        Add stat
      </button>
    </div>);

}

export function FormDrawer({
  open,
  title,
  onClose,
  onSubmit,
  saving,
  children,
  submitLabel = 'Save'








}: {open: boolean;title: string;onClose: () => void;onSubmit: () => void;saving?: boolean;children: React.ReactNode;submitLabel?: string;}) {
  return (
    <AnimatePresence>
      {open &&
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex justify-end bg-ink/40"
        onClick={onClose}>
        
          <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 40, opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          onClick={(event) => event.stopPropagation()}
          className="flex h-full w-full max-w-xl flex-col bg-white">
          
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-6">
              <h2 className="font-heading text-xl text-ink">{title}</h2>
              <button type="button" onClick={onClose} aria-label="Close" className="text-subtle hover:text-ink">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form
            onSubmit={(event) => {
              event.preventDefault();
              onSubmit();
            }}
            className="flex min-h-0 flex-1 flex-col">
            
              <div className="flex-1 space-y-5 overflow-y-auto p-6">{children}</div>
              <div className="flex shrink-0 items-center justify-end gap-3 border-t border-line p-5">
                <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-line px-5 py-2.5 text-sm text-ink transition-colors hover:border-subtle">
                
                  Cancel
                </button>
                <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-teal px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-dark disabled:opacity-60">
                
                  {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                  {submitLabel}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      }
    </AnimatePresence>);

}

export function ConfirmDialog({
  open,
  title,
  description,
  onCancel,
  onConfirm,
  confirmLabel = 'Delete',
  busy








}: {open: boolean;title: string;description?: string;onCancel: () => void;onConfirm: () => void;confirmLabel?: string;busy?: boolean;}) {
  return (
    <AnimatePresence>
      {open &&
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/50 p-4"
        onClick={onCancel}>
        
          <motion.div
          role="alertdialog"
          aria-modal="true"
          aria-label={title}
          initial={{ scale: 0.97, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.97, opacity: 0 }}
          transition={{ duration: 0.22 }}
          onClick={(event) => event.stopPropagation()}
          className="w-full max-w-md rounded-xl border border-line bg-white p-7">
          
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            </span>
            <h2 className="mt-5 font-heading text-xl text-ink">{title}</h2>
            {description && <p className="mt-2 text-sm leading-relaxed text-subtle">{description}</p>}
            <div className="mt-7 flex justify-end gap-3">
              <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-line px-5 py-2.5 text-sm text-ink transition-colors hover:border-subtle">
              
                Cancel
              </button>
              <button
              type="button"
              onClick={onConfirm}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-lg bg-destructive px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60">
              
                {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      }
    </AnimatePresence>);

}