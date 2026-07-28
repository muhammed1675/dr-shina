/**
 * Editorial hero imagery per page. Headline/subtitle copy is editable from
 * the admin Site Settings screen (site_settings table); these background
 * plates are part of the design system.
 */
export const HERO_IMAGES = {
  home: "/8c390a87-5fdf-44fd-b701-40e778c44d36.jpg",
  about: "/4e0c977d-82f3-4ccf-9547-2da248592561.jpg",
  articles: "/f9cac103-88bd-4f5c-99a0-f36b113aa1c8.jpg",
  gallery: "/bc7b284c-36d9-445a-a4ae-7a8eb8787840.jpg",
  projects: "/cdd26b2a-0355-4517-b51e-8fff57c94b5c.jpg",
  contact: "/6432ec0b-f825-490f-94af-b1019c0aefce.jpg"
} as const;

export const PORTRAIT_IMAGE = HERO_IMAGES.about;