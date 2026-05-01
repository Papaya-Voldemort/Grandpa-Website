import type { APIRoute } from "astro";
import {
  createAdminSessionToken,
  getAdminAuthCookieName,
  getAdminSessionTtlSeconds,
  isAdminAuthConfigured,
  validateAdminCredentials,
} from "../../../lib/auth";

export const POST: APIRoute = async ({ request }) => {
  const redirectWithError = (errorCode: string) => {
    const redirectUrl = new URL(`/admin/login/?error=${encodeURIComponent(errorCode)}`, request.url).toString();
    return new Response(null, {
      status: 302,
      headers: {
        Location: redirectUrl,
      },
    });
  };

  try {
    const form = await request.formData();
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    const password = String(form.get("password") ?? "");

    if (!email || !password) {
      return redirectWithError("missing_credentials");
    }

    if (!isAdminAuthConfigured()) {
      return redirectWithError("auth_not_configured");
    }

    const adminSession = validateAdminCredentials(email, password);
    if (!adminSession) {
      return redirectWithError("invalid_credentials");
    }

    const token = createAdminSessionToken(adminSession);
    const cookieName = getAdminAuthCookieName();
    const ttlSeconds = getAdminSessionTtlSeconds();
    const expires = new Date(Date.now() + ttlSeconds * 1000).toUTCString();
    const isSecure = new URL(request.url).protocol === "https:";
    const secureFlag = isSecure ? "; Secure" : "";
    const cookieValue = `${cookieName}=${token}; Path=/; HttpOnly; SameSite=Lax${secureFlag}; Max-Age=${ttlSeconds}; Expires=${expires}`;

    const redirectUrl = new URL("/admin/", request.url).toString();
    return new Response(null, {
      status: 302,
      headers: {
        Location: redirectUrl,
        "Set-Cookie": cookieValue,
      },
    });
  } catch (error: any) {
    console.error("Unexpected login error:", error);
    return redirectWithError("server_error");
  }
};
