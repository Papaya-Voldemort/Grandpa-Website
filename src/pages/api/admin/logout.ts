import type { APIRoute } from "astro";
import { getAdminAuthCookieName } from "../../../lib/auth";

export const POST: APIRoute = async ({ request }) => {
  // Delete cookie by setting it with an expired date manually
  const cookieName = getAdminAuthCookieName();
  const isSecure = new URL(request.url).protocol === "https:";
  const secureFlag = isSecure ? "; Secure" : "";
  const cookieValue = `${cookieName}=; Path=/; HttpOnly; SameSite=Lax${secureFlag}; Expires=Thu, 01 Jan 1970 00:00:00 UTC`;
  
  // Construct a mutable response so the cookie injector doesn't crash
  const redirectUrl = new URL("/admin/login/", request.url).toString();
  return new Response(null, {
    status: 302,
    headers: {
      "Location": redirectUrl,
      "Set-Cookie": cookieValue,
    },
  });
};
