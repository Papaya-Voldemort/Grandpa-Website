import { Query } from 'node-appwrite';
import { i as isAppwriteConfigured, c as createAdminServices, g as getAppwriteConfig } from './appwrite_zKstY23-.mjs';
import { r as requireAdminSession } from './auth_EJspuftz.mjs';

const POST = async ({ request, cookies }) => {
  if (!await requireAdminSession(cookies)) {
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
    queries: [Query.equal("slug", slug), Query.limit(1)]
  });
  if (!existing.rows[0]) {
    return new Response("Post not found.", { status: 404 });
  }
  await databases.deleteRow({ databaseId, tableId, rowId: existing.rows[0].$id });
  return Response.redirect(new URL("/admin/", request.url), 303);
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
