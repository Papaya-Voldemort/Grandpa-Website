const siteEndpoint =
  import.meta.env.APPWRITE_URL ??
  import.meta.env.APPWRITE_ENDPOINT ??
  import.meta.env.APPWRITE_SITE_API_ENDPOINT ??
  import.meta.env.PUBLIC_APPWRITE_ENDPOINT ??
  "";

const siteProjectId =
  import.meta.env.APPWRITE_PROJECT_ID ??
  import.meta.env.APPWRITE_SITE_PROJECT_ID ??
  import.meta.env.PUBLIC_APPWRITE_PROJECT_ID ??
  "";

const defaultDatabaseId = "grandpa_site";
const defaultPostsTableId = "posts";
const defaultMediaBucketId = "media";

export function getAppwriteConfig() {
  return {
    endpoint: siteEndpoint,
    projectId: siteProjectId,
    apiKey: import.meta.env.APPWRITE_KEY ?? import.meta.env.APPWRITE_API_KEY ?? "",
    databaseId: import.meta.env.APPWRITE_DATABASE_ID ?? defaultDatabaseId,
    tableId: import.meta.env.APPWRITE_POSTS_TABLE_ID ?? defaultPostsTableId,
    bucketId: import.meta.env.APPWRITE_MEDIA_BUCKET_ID ?? defaultMediaBucketId,
    adminEmails: (import.meta.env.APPWRITE_ADMIN_EMAILS ?? "")
      .split(",")
      .map((value: string) => value.trim().toLowerCase())
      .filter(Boolean),
    adminUserIds: (import.meta.env.APPWRITE_ADMIN_USER_IDS ?? "")
      .split(",")
      .map((value: string) => value.trim())
      .filter(Boolean),
  };
}

export function isAppwriteConfigured() {
  const { endpoint, projectId, databaseId, tableId } = getAppwriteConfig();
  return Boolean(endpoint && projectId && databaseId && tableId);
}

export function getSessionCookieName() {
  const { projectId } = getAppwriteConfig();
  return projectId ? `a_session_${projectId}` : "a_session";
}
