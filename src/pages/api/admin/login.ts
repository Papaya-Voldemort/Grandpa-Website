import type { APIRoute } from "astro";
import { Account } from "node-appwrite";
import { createServerClient, createSessionClient, getCookieName } from "../../../lib/appwrite";
import { isAdminAllowed } from "../../../lib/auth";

export const POST: APIRoute = async ({ request }) => {
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

      // Prevent a successful Appwrite login from entering admin unless allow-list checks pass.
      const { account: sessionAccount } = createSessionClient(session.secret);
      const user = await sessionAccount.get();
      const adminCandidate = {
        userId: user.$id,
        email: user.email ?? null,
        name: user.name ?? null,
      };
      if (!isAdminAllowed(adminCandidate)) {
        const redirectUrl = new URL("/admin/login/?error=not_allowed", request.url).toString();
        return new Response(null, {
          status: 302,
          headers: {
            Location: redirectUrl,
          },
        });
      }

      // Build Set-Cookie header value manually
      const cookieName = getCookieName();
      console.log(`[login] Successfully authenticated, setting cookie: ${cookieName}`);
      const expires = new Date(session.expire).toUTCString();
      const cookieValue = `${cookieName}=${session.secret}; Path=/; HttpOnly; SameSite=Lax; Secure; Expires=${expires}`;

      // Construct a mutable response so the Astro cookie injector doesn't crash,
      // and manually append the cookie so it's guaranteed to be sent.
      const redirectUrl = new URL("/admin/", request.url).toString();
      const response = new Response(null, {
        status: 302, // Use 302 instead of 303 to avoid browser caching issues with redirects
        headers: {
          "Location": redirectUrl,
          "Set-Cookie": cookieValue,
        },
      });
      return response;
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
