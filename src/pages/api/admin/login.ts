import type { APIRoute } from "astro";
import { Account } from "node-appwrite";
import { Query, createAdminServices, createServerClient, createSessionClient, getCookieName } from "../../../lib/appwrite";
import { isAdminAllowed } from "../../../lib/auth";

export const POST: APIRoute = async ({ request }) => {
  const redirectWithError = (errorCode: string) => {
    const redirectUrl = new URL(`/admin/login/?error=${encodeURIComponent(errorCode)}`, request.url).toString();
    return new Response(null, {
      status: 302,
      headers: {
        Location: redirectUrl,
      },
    });
  };

  try {
    const form = await request.formData();
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    const password = String(form.get("password") ?? "");

    if (!email || !password) {
      return redirectWithError("missing_credentials");
    }

    try {
      const client = createServerClient(false);
      const account = new Account(client);
      const session = await account.createEmailPasswordSession({ email, password });

      // Prevent a successful Appwrite login from entering admin unless allow-list checks pass.
      const { account: sessionAccount } = createSessionClient(session.secret);
      const user = await sessionAccount.get();
      const adminCandidate = {
        userId: user.$id,
        email: user.email ?? null,
        name: user.name ?? null,
      };
      if (!isAdminAllowed(adminCandidate)) {
        return redirectWithError("not_allowed");
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
      const message = String(appwriteError?.message ?? "");
      const type = String(appwriteError?.type ?? "");
      const status = Number(appwriteError?.code ?? appwriteError?.status ?? 0);

      const classifyInvalidCredentials = async () => {
        try {
          const { users } = createAdminServices();
          const result = await users.list({
            queries: [Query.equal("email", [email])],
            total: false,
          });
          const users = result.users ?? [];
          const exists = users.some((user) => String(user.email ?? "").toLowerCase() === email);
          return exists ? "password_not_set_or_wrong" : "email_not_found_in_project";
        } catch (lookupError) {
          console.warn("Failed to run credential diagnostics:", lookupError);
          return "invalid_credentials";
        }
      };
      
      // Handle Appwrite-specific errors
      if (message.toLowerCase().includes("auth method") && message.toLowerCase().includes("disabled")) {
        return redirectWithError("password_auth_disabled");
      }

      if (
        status === 401 ||
        message.includes("Invalid credentials") ||
        message.includes("Invalid email") ||
        type.includes("invalid_credentials")
      ) {
        return redirectWithError(await classifyInvalidCredentials());
      }

      if (status === 429 || type.includes("rate_limit")) {
        return redirectWithError("rate_limited");
      }

      if (message.includes("not configured") || status === 404 || type.includes("project_not_found")) {
        return redirectWithError("project_mismatch");
      }

      return redirectWithError("auth_failed");
    }
  } catch (error: any) {
    console.error("Unexpected login error:", error);
    return redirectWithError("server_error");
  }
};
