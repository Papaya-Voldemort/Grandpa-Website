import { Account, Client, ID, Permission, Query, Role, Storage, TablesDB, Users } from "node-appwrite";
import { getAppwriteConfig, getSessionCookieName } from "./env";

export function createServerClient(withKey = false) {
  const { endpoint, projectId, apiKey } = getAppwriteConfig();
  if (!endpoint || !projectId) {
    const error = new Error("Appwrite endpoint/project ID are not configured.");
    (error as any).statusCode = 503; // Service Unavailable
    throw error;
  }

  const client = new Client().setEndpoint(endpoint).setProject(projectId);

  if (withKey) {
    if (!apiKey) {
      const error = new Error("APPWRITE_KEY is not configured.");
      (error as any).statusCode = 503; // Service Unavailable
      throw error;
    }
    client.setKey(apiKey);
  }

  return client;
}

export function createAdminServices() {
  const client = createServerClient(true);
  return {
    client,
    account: new Account(client),
    databases: new TablesDB(client),
    storage: new Storage(client),
    users: new Users(client),
  };
}

export function createSessionClient(session: string) {
  const client = createServerClient(false);
  client.setSession(session);
  return {
    client,
    account: new Account(client),
    databases: new TablesDB(client),
    storage: new Storage(client),
  };
}

export { ID, Permission, Query, Role };

export function getCookieName() {
  return getSessionCookieName();
}
