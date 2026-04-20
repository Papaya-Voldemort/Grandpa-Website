import type { AstroCookies } from "astro";
import { createSessionClient, getCookieName } from "./appwrite";
import { getAppwriteConfig } from "./env";
import type { AdminSession } from "./types";

export async function getCurrentSession(cookies: AstroCookies): Promise<AdminSession | null> {
  const cookieName = getCookieName();
  const session = cookies.get(cookieName)?.value;
  console.log(`[auth] Check session cookie: ${cookieName} -> ${session ? "present" : "missing"}`);
  
  if (!session) {
    return null;
  }

  try {
    const { account } = createSessionClient(session);
    const user = await account.get();
    console.log(`[auth] Session valid for user: ${user.$id} (${user.email})`);
    return {
      userId: user.$id,
      email: user.email ?? null,
      name: user.name ?? null,
    };
  } catch (error) {
    console.error(`[auth] Failed to verify session with Appwrite:`, error);
    return null;
  }
}

export async function requireAdminSession(cookies: AstroCookies) {
  const current = await getCurrentSession(cookies);
  if (!current) {
    return null;
  }

  const { adminEmails, adminUserIds } = getAppwriteConfig();
  const allowedByEmail = current.email ? adminEmails.includes(current.email.toLowerCase()) : false;
  const allowedById = adminUserIds.includes(current.userId);
  if (adminEmails.length === 0 && adminUserIds.length === 0) {
    return current;
  }

  if (allowedByEmail || allowedById) {
    return current;
  }

  return null;
}
