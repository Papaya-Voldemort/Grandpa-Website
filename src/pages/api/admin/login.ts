import type { APIRoute } from "astro";
import { Account } from "node-appwrite";
import { createServerClient, getCookieName } from "../../../lib/appwrite";

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
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

      // Use Astro's cookies API properly within the try block
      cookies.set(getCookieName(), session.secret, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: true,
        expires: new Date(session.expire),
      });

      // Return JSON response instead of redirect - let client handle navigation
      return new Response(JSON.stringify({ success: true, redirectUrl: "/admin/" }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
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
