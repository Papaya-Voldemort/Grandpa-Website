import type { APIRoute } from "astro";
import { getCookieName } from "../../../lib/appwrite";

export const POST: APIRoute = async ({ cookies, request }) => {
  cookies.delete(getCookieName(), { path: "/" });
  return Response.redirect(new URL("/admin/login/", request.url), 303);
};
