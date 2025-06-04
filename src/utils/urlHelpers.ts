export const createSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export const createActivityUrl = (title: string, uuid: string): string => {
  const slug = createSlug(title);
  return `/activity-details/${slug}-${uuid}`;
};

export const createEventUrl = (title: string, uuid: string): string => {
  const slug = createSlug(title);
  return `/event-detail/${slug}-${uuid}`;
};

export const extractUuidFromSlug = (slugWithUuid: string): string | null => {
  const uuidPattern =
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const match = slugWithUuid.match(uuidPattern);
  return match ? match[0] : null;
};
