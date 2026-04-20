function getEnvVar(key: string): string {
  // Try process.env first for server-side runtime, then import.meta.env
  if (typeof process !== "undefined" && process.env && process.env[key]) {
    return process.env[key] as string;
  }
  return import.meta.env[key] ?? "";
}

const siteEndpoint =
  getEnvVar("APPWRITE_URL") ||
  getEnvVar("APPWRITE_ENDPOINT") ||
  getEnvVar("APPWRITE_SITE_API_ENDPOINT") ||
  getEnvVar("PUBLIC_APPWRITE_ENDPOINT") ||
  "";

const siteProjectId =
  getEnvVar("APPWRITE_PROJECT_ID") ||
  getEnvVar("APPWRITE_SITE_PROJECT_ID") ||
  getEnvVar("PUBLIC_APPWRITE_PROJECT_ID") ||
  "";

const defaultDatabaseId = "grandpa_site";
const defaultPostsTableId = "posts";
const defaultMediaBucketId = "media";

export function getAppwriteConfig() {
  return {
    endpoint: siteEndpoint,
    projectId: siteProjectId,
    apiKey: getEnvVar("APPWRITE_KEY") || getEnvVar("APPWRITE_API_KEY") || "",
    databaseId: getEnvVar("APPWRITE_DATABASE_ID") || defaultDatabaseId,
    tableId: getEnvVar("APPWRITE_POSTS_TABLE_ID") || defaultPostsTableId,
    bucketId: getEnvVar("APPWRITE_MEDIA_BUCKET_ID") || defaultMediaBucketId,
    adminEmails: (getEnvVar("APPWRITE_ADMIN_EMAILS") || "")
      .split(",")
      .map((value: string) => value.trim().toLowerCase())
      .filter(Boolean),
    adminUserIds: (getEnvVar("APPWRITE_ADMIN_USER_IDS") || "")
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
