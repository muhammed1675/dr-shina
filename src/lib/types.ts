export type ArticleStatus = 'draft' | 'published';

export interface Article {
  id: string;
  title: string;
  slug: string;
  cover_image_url: string | null;
  category: string | null;
  tags: string[] | null;
  excerpt: string | null;
  body: string | null;
  reading_time: number | null;
  status: ArticleStatus | string;
  published_at: string | null;
  created_at?: string;
}

export interface GalleryImage {
  id: string;
  image_url: string;
  title: string | null;
  album: string | null;
  display_order: number | null;
  created_at?: string;
}

export interface ImpactStat {
  label: string;
  value: string;
}

export interface Project {
  id: string;
  title: string;
  cover_image_url: string | null;
  description: string | null;
  impact_stats: ImpactStat[] | null;
  partners: string[] | null;
  status: string | null;
  created_at?: string;
}

export interface SpeakingEvent {
  id: string;
  title: string;
  event_date: string | null;
  location: string | null;
  cover_image_url: string | null;
  status: string | null;
  booking_link: string | null;
  created_at?: string;
}

export type MediaType = 'video' | 'podcast' | 'tv' | 'interview' | 'publication';

export interface MediaItem {
  id: string;
  type: MediaType | string;
  title: string;
  thumbnail_url: string | null;
  external_url: string | null;
  item_date: string | null;
  created_at?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  photo_url: string | null;
  quote: string;
  display_order: number | null;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  created_at: string;
}

export interface SiteSetting {
  key: string;
  value: unknown;
}

/* ------------------------------- Rabbit Farm ------------------------------ */

export interface RabbitBreed {
  id: string;
  name: string;
  image_url: string | null;
  description: string | null;
  price: string | null;
  availability: string | null; // available | limited | sold_out
  display_order: number | null;
  created_at?: string;
}

export interface RabbitGalleryImage {
  id: string;
  image_url: string;
  title: string | null;
  album: string | null;
  display_order: number | null;
  created_at?: string;
}

export interface RabbitPost {
  id: string;
  title: string;
  slug: string;
  cover_image_url: string | null;
  excerpt: string | null;
  body: string | null;
  status: string;
  published_at: string | null;
  created_at?: string;
}

export interface RabbitEnquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  interest: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}
