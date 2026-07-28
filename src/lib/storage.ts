import { MEDIA_BUCKET, supabase, isSupabaseConfigured } from './supabase';
import { slugify } from './format';

/**
 * Uploads a file to the public `media` Supabase Storage bucket and returns
 * the public URL to persist in the matching *_image_url / *_url column.
 */
export async function uploadMedia(file: File, folder = 'uploads'): Promise<string> {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not connected — add your keys to .env.local to enable uploads.');
  }

  const extension = file.name.includes('.') ? file.name.split('.').pop() : 'jpg';
  const base = slugify(file.name.replace(/\.[^.]+$/, '')) || 'file';
  const path = `${folder}/${Date.now()}-${base}.${extension}`;

  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false
  });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}