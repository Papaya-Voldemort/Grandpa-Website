import type { APIRoute } from "astro";
import { Query } from "node-appwrite";
import { createAdminServices } from "../../../lib/appwrite";
import { requireAdminSession } from "../../../lib/auth";
import { getAppwriteConfig, isAppwriteConfigured } from "../../../lib/env";
import { normalizeLegacyHtml } from "../../../lib/content";
import { getRowId, slugify } from "../../../lib/slug";

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!(await requireAdminSession(cookies))) {
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
  const now = new Date().toISOString();

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
    sortOrder,
  };

  const existing = await databases.listRows({
    databaseId,
    tableId,
    queries: [Query.equal("slug", originalSlug || slug), Query.limit(1)],
  });
  const slugConflict = await databases.listRows({
    databaseId,
    tableId,
    queries: [Query.equal("slug", slug), Query.limit(1)],
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
      data: row,
    });
    if (previousRow.$id !== rowId) {
      await databases.deleteRow({ databaseId, tableId, rowId: previousRow.$id });
    }
  } else {
    await databases.upsertRow({
      databaseId,
      tableId,
      rowId,
      data: row,
    });
  }

  return Response.redirect(new URL(`/admin/posts/${slug}/`, request.url), 303);
};
