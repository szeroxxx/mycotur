/**
 * Converts a title into a URL-friendly slug
 * @param title The title to convert to a slug
 * @returns A URL-friendly slug
 */
export const createSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple consecutive hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Creates a URL with title slug and UUID
 * @param title The activity title
 * @param uuid The activity UUID
 * @returns A slug-based URL path
 */
export const createActivityUrl = (title: string, uuid: string): string => {
  const slug = createSlug(title);
  return `/activity-details/${slug}-${uuid}`;
};

/**
 * Creates a URL with title slug and UUID for events
 * @param title The event title
 * @param uuid The event UUID
 * @returns A slug-based URL path
 */
export const createEventUrl = (title: string, uuid: string): string => {
  const slug = createSlug(title);
  return `/event-detail/${slug}-${uuid}`;
};

/**
 * Extracts UUID from a slug-based URL
 * @param slugWithUuid The slug with UUID (e.g., "mountain-hiking-adventure-12faa9cd-bc1d-4f76-874c-371b3687a1f7")
 * @returns The extracted UUID or null if not found
 */
export const extractUuidFromSlug = (slugWithUuid: string): string | null => {
  // UUID pattern: 8-4-4-4-12 hexadecimal characters
  const uuidPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const match = slugWithUuid.match(uuidPattern);
  return match ? match[0] : null;
};