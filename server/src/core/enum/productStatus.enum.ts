export enum PRODUCT_STATUS {
  // Initial state, visible only on CMS, not public
  DRAFT = 'draft',
  // Publicly available for viewing and purchase
  PUBLISHED = 'published',
  // Archived or temporarily hidden from public view
  HIDDEN = 'hidden',
  // No longer for sale but kept for SEO and history
  DISCONTINUED = 'discontinued',
}
