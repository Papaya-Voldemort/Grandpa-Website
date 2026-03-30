import type { AstroCookies } from "astro";
import { createSessionClient, getCookieName } from "./appwrite";
import { getAppwriteConfig } from "./env";
import type { AdminSession } from "./types";

export async function getCurrentSession(cookies: AstroCookies): Promise<AdminSession | null> {
  const session = cookies.get(getCookieName())?.value;
  if (!session) {
    return null;
  }

  try {
    const { account } = createSessionClient(session);
    const user = await account.get();
    return {
      userId: user.$id,
      email: user.email ?? null,
      name: user.name ?? null,
    };
  } catch {
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
