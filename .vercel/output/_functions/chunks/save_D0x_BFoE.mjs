import { Query } from 'node-appwrite';
import { i as isAppwriteConfigured, c as createAdminServices, g as getAppwriteConfig } from './appwrite_zKstY23-.mjs';
import { r as requireAdminSession } from './auth_EJspuftz.mjs';
import { n as normalizeLegacyHtml } from './content_CZ0DdAXs.mjs';

function slugify(value) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").replace(/-{2,}/g, "-");
}
function hashValue(value) {
  let hash = 5381;
  for (let index = 0; index < value.length; index += 1) {
    hash = hash * 33 ^ value.charCodeAt(index);
  }
  return (hash >>> 0).toString(36);
}
function getRowId(value) {
  const slug = slugify(value) || "post";
  if (slug.length <= 36) {
    return slug;
  }
  const hash = hashValue(value).slice(0, 8);
  const prefix = slug.slice(0, 27).replace(/[-_.]+$/g, "") || "post";
  return `${prefix}-${hash}`;
}

const POST = async ({ request, cookies }) => {
  if (!await requireAdminSession(cookies)) {
    return new Response("Unauthorized", { status: 401 });
  }
  if (!isAppwriteConfigured()) {
    return new Response("Appwrite is not configured.", { status: 500 });
  }
  const form = await request.formData();
  const originalSlug = String(form.get("originalSlug") ?? "").trim();
  const rawSlug = String(form.get("slug") ?? "").trim();
  const title = String(form.get("title") ?? "").trim();
  const category = String(form.get("category") ?? "").trim();
  const categoryLabel = String(form.get("categoryLabel") ?? "").trim() || category;
  const excerpt = String(form.get("excerpt") ?? "").trim();
  const status = String(form.get("status") ?? "draft").trim();
  const coverImage = String(form.get("coverImage") ?? "").trim() || null;
  const publishedAt = String(form.get("publishedAt") ?? "").trim() || null;
  const archivedAt = String(form.get("archivedAt") ?? "").trim() || null;
  const legacySourcePath = String(form.get("legacySourcePath") ?? "").trim() || null;
  const legacyUrl = String(form.get("legacyUrl") ?? "").trim() || null;
  const contentHtml = normalizeLegacyHtml(String(form.get("contentHtml") ?? "").trim(), legacySourcePath ?? legacyUrl ?? "");
  const sortOrder = Number.parseInt(String(form.get("sortOrder") ?? "0"), 10) || 0;
  const now = (/* @__PURE__ */ new Date()).toISOString();
  if (!title || !category) {
    return new Response("Title and category are required.", { status: 400 });
  }
  const slug = slugify(rawSlug || title);
  const { databases } = createAdminServices();
  const { databaseId, tableId } = getAppwriteConfig();
  const effectiveStatus = status === "published" ? "published" : status === "archived" ? "archived" : "draft";
  const row = {
    slug,
    title,
    category,
    categoryLabel,
    excerpt,
    contentHtml,
    coverImage,
    status: effectiveStatus,
    publishedAt: publishedAt || (effectiveStatus === "published" ? now : null),
    archivedAt: archivedAt || (effectiveStatus === "archived" ? now : null),
    legacySourcePath,
    legacyUrl,
    sortOrder
  };
  const existing = await databases.listRows({
    databaseId,
    tableId,
    queries: [Query.equal("slug", originalSlug || slug), Query.limit(1)]
  });
  const slugConflict = await databases.listRows({
    databaseId,
    tableId,
    queries: [Query.equal("slug", slug), Query.limit(1)]
  });
  const previousRow = existing.rows[0];
  const conflictingRow = slugConflict.rows[0];
  if (conflictingRow && conflictingRow.$id !== previousRow?.$id) {
    return new Response("That slug is already in use.", { status: 409 });
  }
  const rowId = getRowId(slug);
  if (previousRow) {
    await databases.upsertRow({
      databaseId,
      tableId,
      rowId,
      data: row
    });
    if (previousRow.$id !== rowId) {
      await databases.deleteRow({ databaseId, tableId, rowId: previousRow.$id });
    }
  } else {
    await databases.upsertRow({
      databaseId,
      tableId,
      rowId,
      data: row
    });
  }
  return Response.redirect(new URL(`/admin/posts/${slug}/`, request.url), 303);
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
