import { c as createComponent } from './astro-component_BhUZwqY9.mjs';
import 'piccolore';
import { l as renderComponent, r as renderTemplate, m as maybeRenderHead } from './entrypoint_BjHBL06r.mjs';
import { $ as $$BaseLayout } from './BaseLayout_BJkAhuu4.mjs';
import { g as getCurrentSession } from './auth_EJspuftz.mjs';

const prerender = false;
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Index;
  const session = await getCurrentSession(Astro2.cookies);
  if (session) {
    return Astro2.redirect("/admin/", 302);
  }
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Post Maker | Stephen M. Bird", "pageClass": "post-maker-hub", "showSidebar": false }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="panel admin-hub"> <h1>Post Maker</h1> <p>
This is the safe place to write, edit, archive, or delete posts without touching HTML files.
</p> <p class="admin-notice">
If you are Stephen, sign in and the dashboard will open the editor, preview, and archive tools.
</p> <p> <a class="action-button" href="/admin/login/">Sign In to Post Maker</a> </p> <p> <a href="/admin/">Open Dashboard</a> </p> </div> ` })}`;
}, "/workspaces/Grandpa-Website/src/pages/post-maker/index.astro", void 0);

const $$file = "/workspaces/Grandpa-Website/src/pages/post-maker/index.astro";
const $$url = "/post-maker";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
