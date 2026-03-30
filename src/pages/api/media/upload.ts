import type { APIRoute } from "astro";
import { ID, Permission, Role } from "node-appwrite";
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
  const file = form.get("file");
  if (!(file instanceof File)) {
    return new Response("Missing file.", { status: 400 });
  }

  const { storage } = createAdminServices();
  const { bucketId, endpoint, projectId } = getAppwriteConfig();
  if (!bucketId) {
    return new Response("Media bucket is not configured.", { status: 500 });
  }

  const created = await storage.createFile({
    bucketId,
    fileId: ID.unique(),
    file,
    permissions: [Permission.read(Role.any())],
  });

  const url = new URL(`/storage/buckets/${bucketId}/files/${created.$id}/view?project=${projectId}`, endpoint).toString();
  return Response.json({ fileId: created.$id, url });
};
