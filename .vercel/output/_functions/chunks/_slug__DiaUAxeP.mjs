import { c as createComponent } from './astro-component_BhUZwqY9.mjs';
import 'piccolore';
import { l as renderComponent, r as renderTemplate, m as maybeRenderHead, h as addAttribute, u as unescapeHTML } from './entrypoint_BjHBL06r.mjs';
import { $ as $$BaseLayout } from './BaseLayout_BJkAhuu4.mjs';
import { f as getPageBySlug } from './posts-server_B9fCINhK.mjs';
import { g as getCurrentSession } from './auth_EJspuftz.mjs';

const prerender = false;
const $$slug = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$slug;
  const slug = Astro2.params.slug ?? "";
  const page = await getPageBySlug(slug);
  if (!page) {
    return new Response("Not found", { status: 404 });
  }
  const session = await getCurrentSession(Astro2.cookies);
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": `${page.title} | Stephen M. Bird`, "description": page.title }, { "default": async ($$result2) => renderTemplate`${session && page.$id && renderTemplate`${maybeRenderHead()}<div style="margin-bottom: 2rem; padding: 1rem; background-color: #fef4dd; border: 1px solid #fbb51a; border-radius: 4px; display: flex; justify-content: space-between; align-items: center;"> <strong style="color: #252161;">You are logged in as Admin.</strong> <a${addAttribute(`/admin/posts/${page.$id}`, "href")} class="admin-callout">EDIT THIS POST</a> </div>`}<div class="legacy-body">${unescapeHTML(page.contentHtml)}</div> ` })}`;
}, "/workspaces/Grandpa-Website/src/pages/[slug].astro", void 0);

const $$file = "/workspaces/Grandpa-Website/src/pages/[slug].astro";
const $$url = "/[slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$slug,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
