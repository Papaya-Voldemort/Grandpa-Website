import type { APIRoute } from "astro";
import { Account } from "node-appwrite";
import { createServerClient, getCookieName } from "../../../lib/appwrite";

export const POST: APIRoute = async ({ request, cookies }) => {
  const form = await request.formData();
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");

  if (!email || !password) {
    return new Response("Missing email or password.", { status: 400 });
  }

  try {
    const client = createServerClient(false);
    const account = new Account(client);
    const session = await account.createEmailPasswordSession(email, password);

    cookies.set(getCookieName(), session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      expires: new Date(session.expire),
    });

    return Response.redirect(new URL("/admin/", request.url), 303);
  } catch (error) {
    console.error(error);
    return new Response("Unable to sign in.", { status: 401 });
  }
};
