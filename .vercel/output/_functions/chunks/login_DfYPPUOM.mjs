import { a as isAdminAuthConfigured, v as validateAdminCredentials, c as createAdminSessionToken, b as getAdminAuthCookieName, d as getAdminSessionTtlSeconds } from './auth_EJspuftz.mjs';

const POST = async ({ request }) => {
  const redirectWithError = (errorCode) => {
    const redirectUrl = new URL(`/admin/login/?error=${encodeURIComponent(errorCode)}`, request.url).toString();
    return new Response(null, {
      status: 302,
      headers: {
        Location: redirectUrl
      }
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
    const expires = new Date(Date.now() + ttlSeconds * 1e3).toUTCString();
    const isSecure = new URL(request.url).protocol === "https:";
    const secureFlag = isSecure ? "; Secure" : "";
    const cookieValue = `${cookieName}=${token}; Path=/; HttpOnly; SameSite=Lax${secureFlag}; Max-Age=${ttlSeconds}; Expires=${expires}`;
    const redirectUrl = new URL("/admin/", request.url).toString();
    return new Response(null, {
      status: 302,
      headers: {
        Location: redirectUrl,
        "Set-Cookie": cookieValue
      }
    });
  } catch (error) {
    console.error("Unexpected login error:", error);
    return redirectWithError("server_error");
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
