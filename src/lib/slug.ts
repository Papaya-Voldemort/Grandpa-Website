export function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function hashValue(value: string) {
  let hash = 5381;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 33) ^ value.charCodeAt(index);
  }
  return (hash >>> 0).toString(36);
}

export function getRowId(value: string) {
  const slug = slugify(value) || "post";
  if (slug.length <= 36) {
    return slug;
  }

  const hash = hashValue(value).slice(0, 8);
  const prefix = slug.slice(0, 27).replace(/[-_.]+$/g, "") || "post";
  return `${prefix}-${hash}`;
}
