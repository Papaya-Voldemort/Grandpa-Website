import type { APIRoute } from "astro";
import { Account } from "node-appwrite";
import { createServerClient, getCookieName } from "../../../lib/appwrite";

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
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

      // Build Set-Cookie header value manually to avoid immutable headers issue
      const cookieName = getCookieName();
      const expires = new Date(session.expire).toUTCString();
      const cookieValue = `${cookieName}=${session.secret}; Path=/; HttpOnly; SameSite=Lax; Secure; Expires=${expires}`;

      // Return redirect with Set-Cookie header instead of using cookies API
      const redirectUrl = new URL("/admin/", request.url).toString();
      return new Response(null, {
        status: 303,
        headers: {
          "Location": redirectUrl,
          "Set-Cookie": cookieValue,
        },
      });
    } catch (appwriteError: any) {
      console.error("Appwrite error:", appwriteError);
      
      // Handle Appwrite-specific errors
      if (appwriteError?.message?.includes("Invalid credentials") || appwriteError?.message?.includes("Invalid email")) {
        return new Response("Invalid email or password.", { status: 401 });
      }
      
      if (appwriteError?.message?.includes("not configured")) {
        return new Response("Server configuration error. Please contact administrator.", { status: 503 });
      }
      
      if (appwriteError?.code === 401 || appwriteError?.status === 401) {
        return new Response("Invalid email or password.", { status: 401 });
      }
      
      // Default to 401 for authentication failures
      return new Response(appwriteError?.message || "Unable to sign in.", { status: 401 });
    }
  } catch (error: any) {
    console.error("Unexpected login error:", error);
    return new Response("Internal server error. Please try again later.", { status: 500 });
  }
};
