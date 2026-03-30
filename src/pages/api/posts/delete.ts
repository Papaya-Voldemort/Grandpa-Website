import type { APIRoute } from "astro";
import { Query } from "node-appwrite";
import { createAdminServices } from "../../../lib/appwrite";
import { requireAdminSession } from "../../../lib/auth";
import { getAppwriteConfig, isAppwriteConfigured } from "../../../lib/env";

export const POST: APIRoute = async ({ request, cookies }) => {
  if (!(await requireAdminSession(cookies))) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!isAppwriteConfigured()) {
    return new Response("Appwrite is not configured.", { status: 500 });
  }

  const form = await request.formData();
  const slug = String(form.get("slug") ?? "").trim();
  if (!slug) {
    return new Response("Missing slug.", { status: 400 });
  }

  const { databases } = createAdminServices();
  const { databaseId, tableId } = getAppwriteConfig();
  const existing = await databases.listRows({
    databaseId,
    tableId,
    queries: [Query.equal("slug", slug), Query.limit(1)],
  });

  if (!existing.rows[0]) {
    return new Response("Post not found.", { status: 404 });
  }

  await databases.deleteRow({ databaseId, tableId, rowId: existing.rows[0].$id });
  return Response.redirect(new URL("/admin/", request.url), 303);
};
