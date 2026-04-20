import type { APIRoute } from "astro";
import { getCookieName } from "../../../lib/appwrite";

export const POST: APIRoute = async ({ cookies, redirect }) => {
  // Delete the session cookie
  cookies.delete(getCookieName(), { path: "/" });
  
  // Use Astro's redirect which properly handles the cookie deletion
  return redirect("/admin/login/", 303);
};
