import type { AstroCookies } from "astro";
import { createHmac, timingSafeEqual } from "node:crypto";
import type { AdminSession } from "./types";

type SignedSessionPayload = {
  userId: string;
  email: string;
  name: string | null;
  exp: number;
};

type AdminAuthConfig = {
  email: string;
  password: string;
  name: string;
  sessionSecret: string;
  cookieName: string;
  sessionTtlSeconds: number;
};

function getEnvVar(key: string): string {
  if (typeof process !== "undefined" && process.env && process.env[key]) {
    return String(process.env[key]);
  }
  return String(import.meta.env[key] ?? "");
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function toBase64Url(value: string): string {
  return Buffer.from(value, "utf8").toString("base64url");
}

function fromBase64Url(value: string): string {
  return Buffer.from(value, "base64url").toString("utf8");
}

function safeEqual(a: string, b: string): boolean {
  const aBytes = Buffer.from(a, "utf8");
  const bBytes = Buffer.from(b, "utf8");
  if (aBytes.length !== bBytes.length) {
    return false;
  }
  return timingSafeEqual(aBytes, bBytes);
}

function getAdminAuthConfig(): AdminAuthConfig {
  const ttlHoursRaw = Number(getEnvVar("ADMIN_AUTH_SESSION_TTL_HOURS") || "12");
  const ttlHours = Number.isFinite(ttlHoursRaw) && ttlHoursRaw > 0 ? ttlHoursRaw : 12;

  return {
    email: normalizeEmail(getEnvVar("ADMIN_AUTH_EMAIL")),
    password: getEnvVar("ADMIN_AUTH_PASSWORD"),
    name: getEnvVar("ADMIN_AUTH_NAME") || "Admin",
    sessionSecret: getEnvVar("ADMIN_AUTH_SESSION_SECRET"),
    cookieName: getEnvVar("ADMIN_AUTH_COOKIE_NAME") || "admin_session",
    sessionTtlSeconds: Math.floor(ttlHours * 60 * 60),
  };
}

function signPayload(payloadBase64: string, secret: string): string {
  return createHmac("sha256", secret).update(payloadBase64).digest("base64url");
}

function buildUserId(email: string): string {
  return `admin:${toBase64Url(email)}`;
}

function parseSignedSession(token: string): SignedSessionPayload | null {
  const { sessionSecret } = getAdminAuthConfig();
  if (!sessionSecret || !token.includes(".")) {
    return null;
  }

  const [payloadBase64, signature] = token.split(".");
  if (!payloadBase64 || !signature) {
    return null;
  }

  const expectedSignature = signPayload(payloadBase64, sessionSecret);
  if (!safeEqual(signature, expectedSignature)) {
    return null;
  }

  try {
    const payload = JSON.parse(fromBase64Url(payloadBase64)) as SignedSessionPayload;
    if (!payload?.email || !payload?.userId || !payload?.exp) {
      return null;
    }

    if (payload.exp <= Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function isAdminAuthConfigured(): boolean {
  const { email, password, sessionSecret } = getAdminAuthConfig();
  return Boolean(email && password && sessionSecret);
}

export function getAdminAuthCookieName(): string {
  return getAdminAuthConfig().cookieName;
}

export function getAdminSessionTtlSeconds(): number {
  return getAdminAuthConfig().sessionTtlSeconds;
}

export function createAdminSessionToken(session: AdminSession): string {
  const { sessionSecret, sessionTtlSeconds } = getAdminAuthConfig();
  if (!sessionSecret) {
    throw new Error("ADMIN_AUTH_SESSION_SECRET is not configured.");
  }

  const payload: SignedSessionPayload = {
    userId: session.userId,
    email: normalizeEmail(session.email || ""),
    name: session.name ?? null,
    exp: Date.now() + sessionTtlSeconds * 1000,
  };
  const payloadBase64 = toBase64Url(JSON.stringify(payload));
  const signature = signPayload(payloadBase64, sessionSecret);
  return `${payloadBase64}.${signature}`;
}

export function validateAdminCredentials(email: string, password: string): AdminSession | null {
  const config = getAdminAuthConfig();
  const normalizedEmail = normalizeEmail(email);
  if (!config.email || !config.password || !config.sessionSecret) {
    return null;
  }

  const emailMatches = safeEqual(normalizedEmail, config.email);
  const passwordMatches = safeEqual(password, config.password);
  if (!emailMatches || !passwordMatches) {
    return null;
  }

  return {
    userId: buildUserId(config.email),
    email: config.email,
    name: config.name,
  };
}

export function isAdminAllowed(current: AdminSession): boolean {
  const { email } = getAdminAuthConfig();
  if (!email) {
    return false;
  }

  return normalizeEmail(current.email || "") === email && current.userId === buildUserId(email);
}

export async function getCurrentSession(cookies: AstroCookies): Promise<AdminSession | null> {
  const cookieName = getAdminAuthCookieName();
  const token = cookies.get(cookieName)?.value;
  if (!token) {
    return null;
  }

  const parsed = parseSignedSession(token);
  if (!parsed) {
    return null;
  }

  const session: AdminSession = {
    userId: parsed.userId,
    email: parsed.email,
    name: parsed.name,
  };
  return isAdminAllowed(session) ? session : null;
}

export async function requireAdminSession(cookies: AstroCookies) {
  const current = await getCurrentSession(cookies);
  if (!current) {
    return null;
  }

  if (isAdminAllowed(current)) {
    return current;
  }

  return null;
}
