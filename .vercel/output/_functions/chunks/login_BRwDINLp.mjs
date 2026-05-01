import { c as createComponent } from './astro-component_BhUZwqY9.mjs';
import 'piccolore';
import { l as renderComponent, r as renderTemplate, m as maybeRenderHead } from './entrypoint_BjHBL06r.mjs';
import { $ as $$BaseLayout } from './BaseLayout_BJkAhuu4.mjs';
import { g as getCurrentSession, i as isAdminAllowed } from './auth_EJspuftz.mjs';

const prerender = false;
const $$Login = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Login;
  const session = await getCurrentSession(Astro2.cookies);
  const error = Astro2.url.searchParams.get("error") ?? "";
  const isAllowed = session ? isAdminAllowed(session) : false;
  if (session && isAllowed) {
    return Astro2.redirect("/admin/", 302);
  }
  const errorMessage = session && !isAllowed ? "Your session is not authorized for admin access." : error === "invalid_credentials" ? "Invalid email or password." : error === "auth_not_configured" ? "Admin auth is not configured. Set ADMIN_AUTH_EMAIL, ADMIN_AUTH_PASSWORD, and ADMIN_AUTH_SESSION_SECRET in production env vars." : error === "missing_credentials" ? "Please enter both email and password." : error === "server_error" ? "Sign in failed due to a server-side error." : null;
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Post Maker Login | Stephen M. Bird", "pageClass": "admin-login", "showSidebar": false }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="panel"> <h1>Post Maker Login</h1> <p>Sign in with the admin email and password configured in environment variables.</p> <p>This login does not use Appwrite authentication.</p> ${errorMessage ? renderTemplate`<p class="admin-notice">${errorMessage}</p>` : null} <form class="card auth-card" method="post" action="/api/admin/login"> <div class="form-grid"> <label>
Email
<input type="email" name="email" required> </label> <label>
Password
<input type="password" name="password" required> </label> <button type="submit">Sign In</button> </div> </form> </div> ` })}`;
}, "/workspaces/Grandpa-Website/src/pages/admin/login.astro", void 0);

const $$file = "/workspaces/Grandpa-Website/src/pages/admin/login.astro";
const $$url = "/admin/login";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Login,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
