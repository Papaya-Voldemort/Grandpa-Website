import { timingSafeEqual, createHmac } from 'node:crypto';

const __vite_import_meta_env__ = {"ASSETS_PREFIX": undefined, "BASE_URL": "/", "DEV": false, "MODE": "production", "PROD": true, "SITE": undefined, "SSR": true};
function getEnvVar(key) {
  if (typeof process !== "undefined" && process.env && process.env[key]) {
    return String(process.env[key]);
  }
  return String(Object.assign(__vite_import_meta_env__, { USER: "codespace", _: "/home/codespace/nvm/current/bin/npm" })[key] ?? "");
}
function normalizeEmail(value) {
  return value.trim().toLowerCase();
}
function toBase64Url(value) {
  return Buffer.from(value, "utf8").toString("base64url");
}
function fromBase64Url(value) {
  return Buffer.from(value, "base64url").toString("utf8");
}
function safeEqual(a, b) {
  const aBytes = Buffer.from(a, "utf8");
  const bBytes = Buffer.from(b, "utf8");
  if (aBytes.length !== bBytes.length) {
    return false;
  }
  return timingSafeEqual(aBytes, bBytes);
}
function getAdminAuthConfig() {
  const ttlHoursRaw = Number(getEnvVar("ADMIN_AUTH_SESSION_TTL_HOURS") || "12");
  const ttlHours = Number.isFinite(ttlHoursRaw) && ttlHoursRaw > 0 ? ttlHoursRaw : 12;
  return {
    email: normalizeEmail(getEnvVar("ADMIN_AUTH_EMAIL")),
    password: getEnvVar("ADMIN_AUTH_PASSWORD"),
    name: getEnvVar("ADMIN_AUTH_NAME") || "Admin",
    sessionSecret: getEnvVar("ADMIN_AUTH_SESSION_SECRET"),
    cookieName: getEnvVar("ADMIN_AUTH_COOKIE_NAME") || "admin_session",
    sessionTtlSeconds: Math.floor(ttlHours * 60 * 60)
  };
}
function getAdminAuthUsers() {
  const raw = getEnvVar("ADMIN_AUTH_USERS") || "";
  const entries = raw.split(",").map((s) => s.trim()).filter(Boolean);
  if (entries.length === 0) {
    const cfg = getAdminAuthConfig();
    if (cfg.email && cfg.password) {
      return [{ email: cfg.email, password: cfg.password, name: cfg.name }];
    }
    return [];
  }
  const parsed = entries.map((entry) => {
    const parts = entry.split("|");
    const email = normalizeEmail(parts[0] ?? "");
    const password = parts[1] ?? "";
    const name = parts[2] ?? "Admin";
    return { email, password, name };
  }).filter((u) => u.email && u.password);
  return parsed;
}
function signPayload(payloadBase64, secret) {
  return createHmac("sha256", secret).update(payloadBase64).digest("base64url");
}
function buildUserId(email) {
  return `admin:${toBase64Url(email)}`;
}
function parseSignedSession(token) {
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
    const payload = JSON.parse(fromBase64Url(payloadBase64));
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
function isAdminAuthConfigured() {
  const cfg = getAdminAuthConfig();
  const users = getAdminAuthUsers();
  return Boolean(cfg.sessionSecret && users.length > 0);
}
function getAdminAuthCookieName() {
  return getAdminAuthConfig().cookieName;
}
function getAdminSessionTtlSeconds() {
  return getAdminAuthConfig().sessionTtlSeconds;
}
function createAdminSessionToken(session) {
  const { sessionSecret, sessionTtlSeconds } = getAdminAuthConfig();
  if (!sessionSecret) {
    throw new Error("ADMIN_AUTH_SESSION_SECRET is not configured.");
  }
  const payload = {
    userId: session.userId,
    email: normalizeEmail(session.email || ""),
    name: session.name ?? null,
    exp: Date.now() + sessionTtlSeconds * 1e3
  };
  const payloadBase64 = toBase64Url(JSON.stringify(payload));
  const signature = signPayload(payloadBase64, sessionSecret);
  return `${payloadBase64}.${signature}`;
}
function validateAdminCredentials(email, password) {
  const normalizedEmail = normalizeEmail(email);
  const users = getAdminAuthUsers();
  for (const u of users) {
    if (safeEqual(normalizedEmail, u.email) && safeEqual(password, u.password)) {
      return { userId: buildUserId(u.email), email: u.email, name: u.name };
    }
  }
  return null;
}
function isAdminAllowed(current) {
  const users = getAdminAuthUsers();
  const normalized = normalizeEmail(current.email || "");
  return users.some((u) => normalized === u.email && current.userId === buildUserId(u.email));
}
async function getCurrentSession(cookies) {
  const cookieName = getAdminAuthCookieName();
  const token = cookies.get(cookieName)?.value;
  if (!token) {
    return null;
  }
  const parsed = parseSignedSession(token);
  if (!parsed) {
    return null;
  }
  const session = {
    userId: parsed.userId,
    email: parsed.email,
    name: parsed.name
  };
  return isAdminAllowed(session) ? session : null;
}
async function requireAdminSession(cookies) {
  const current = await getCurrentSession(cookies);
  if (!current) {
    return null;
  }
  if (isAdminAllowed(current)) {
    return current;
  }
  return null;
}

export { isAdminAuthConfigured as a, getAdminAuthCookieName as b, createAdminSessionToken as c, getAdminSessionTtlSeconds as d, getCurrentSession as g, isAdminAllowed as i, requireAdminSession as r, validateAdminCredentials as v };
