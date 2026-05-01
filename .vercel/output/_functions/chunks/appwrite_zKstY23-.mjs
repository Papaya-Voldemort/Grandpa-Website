import { Users, Storage, TablesDB, Account, Client } from 'node-appwrite';

const __vite_import_meta_env__ = {"ASSETS_PREFIX": undefined, "BASE_URL": "/", "DEV": false, "MODE": "production", "PROD": true, "SITE": undefined, "SSR": true};
function getEnvVar(key) {
  if (typeof process !== "undefined" && process.env && process.env[key]) {
    return process.env[key];
  }
  return Object.assign(__vite_import_meta_env__, { USER: "codespace", _: "/home/codespace/nvm/current/bin/npm" })[key] ?? "";
}
const siteEndpoint = getEnvVar("APPWRITE_URL") || getEnvVar("APPWRITE_ENDPOINT") || getEnvVar("APPWRITE_SITE_API_ENDPOINT") || getEnvVar("PUBLIC_APPWRITE_ENDPOINT") || "";
const siteProjectId = getEnvVar("APPWRITE_PROJECT_ID") || getEnvVar("APPWRITE_SITE_PROJECT_ID") || getEnvVar("PUBLIC_APPWRITE_PROJECT_ID") || "";
const defaultDatabaseId = "grandpa_site";
const defaultPostsTableId = "posts";
const defaultMediaBucketId = "media";
function getAppwriteConfig() {
  return {
    endpoint: siteEndpoint,
    projectId: siteProjectId,
    apiKey: getEnvVar("APPWRITE_KEY") || getEnvVar("APPWRITE_API_KEY") || "",
    databaseId: getEnvVar("APPWRITE_DATABASE_ID") || defaultDatabaseId,
    tableId: getEnvVar("APPWRITE_POSTS_TABLE_ID") || defaultPostsTableId,
    bucketId: getEnvVar("APPWRITE_MEDIA_BUCKET_ID") || defaultMediaBucketId,
    adminEmails: (getEnvVar("APPWRITE_ADMIN_EMAILS") || "").split(",").map((value) => value.trim().toLowerCase()).filter(Boolean),
    adminUserIds: (getEnvVar("APPWRITE_ADMIN_USER_IDS") || "").split(",").map((value) => value.trim()).filter(Boolean)
  };
}
function isAppwriteConfigured() {
  const { endpoint, projectId, databaseId, tableId } = getAppwriteConfig();
  return Boolean(endpoint && projectId && databaseId && tableId);
}

function createServerClient(withKey = false) {
  const { endpoint, projectId, apiKey } = getAppwriteConfig();
  if (!endpoint || !projectId) {
    const error = new Error("Appwrite endpoint/project ID are not configured.");
    error.statusCode = 503;
    throw error;
  }
  const client = new Client().setEndpoint(endpoint).setProject(projectId);
  if (withKey) {
    if (!apiKey) {
      const error = new Error("APPWRITE_KEY is not configured.");
      error.statusCode = 503;
      throw error;
    }
    client.setKey(apiKey);
  }
  return client;
}
function createAdminServices() {
  const client = createServerClient(true);
  return {
    client,
    account: new Account(client),
    databases: new TablesDB(client),
    storage: new Storage(client),
    users: new Users(client)
  };
}

export { createAdminServices as c, getAppwriteConfig as g, isAppwriteConfigured as i };
