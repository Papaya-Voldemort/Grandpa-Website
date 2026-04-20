import type { APIRoute } from "astro";
import { getCookieName } from "../../../lib/appwrite";

export const POST: APIRoute = async ({ request }) => {
  // Delete cookie by setting it with an expired date
  const cookieName = getCookieName();
  const cookieValue = `${cookieName}=; Path=/; HttpOnly; SameSite=Lax; Secure; Expires=Thu, 01 Jan 1970 00:00:00 UTC`;
  
  const redirectUrl = new URL("/admin/login/", request.url).toString();
  return new Response(null, {
    status: 303,
    headers: {
      "Location": redirectUrl,
      "Set-Cookie": cookieValue,
    },
  });
};
