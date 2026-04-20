import type { APIRoute } from "astro";
import { getCookieName } from "../../../lib/appwrite";

export const POST: APIRoute = async ({ cookies }) => {
  // Delete the session cookie
  cookies.delete(getCookieName(), { path: "/" });
  
  // Return JSON response with redirect URL
  return new Response(JSON.stringify({ success: true, redirectUrl: "/admin/login/" }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
