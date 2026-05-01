import { Permission, Role, ID } from 'node-appwrite';
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
  const file = form.get("file");
  if (!(file instanceof File)) {
    return new Response("Missing file.", { status: 400 });
  }
  const { storage } = createAdminServices();
  const { bucketId, endpoint, projectId } = getAppwriteConfig();
  const created = await storage.createFile({
    bucketId,
    fileId: ID.unique(),
    file,
    permissions: [Permission.read(Role.any())]
  });
  const url = new URL(`/storage/buckets/${bucketId}/files/${created.$id}/view?project=${projectId}`, endpoint).toString();
  return Response.json({ fileId: created.$id, url });
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
