import { c as createComponent } from './astro-component_BhUZwqY9.mjs';
import 'piccolore';
import { l as renderComponent, r as renderTemplate, m as maybeRenderHead, h as addAttribute } from './entrypoint_BjHBL06r.mjs';
import { $ as $$BaseLayout } from './BaseLayout_BJkAhuu4.mjs';
import { $ as $$PostCard } from './PostCard_C8FR3mf3.mjs';
import { g as getCategoryInfo } from './categories_Z_vDg2NH.mjs';
import { d as getPostsForCategory } from './posts-server_B9fCINhK.mjs';

const prerender = false;
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Index;
  const category = Astro2.params.category ?? "";
  const info = getCategoryInfo(category);
  const posts = await getPostsForCategory(category);
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": `${info.label} | Stephen M. Bird`, "description": info.intro, "pageClass": `category-${category}` }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="panel"> <img${addAttribute(info.headerImage, "src")}${addAttribute(info.label, "alt")}> <h1>${info.label}</h1> <p>${info.intro}</p> <section class="post-grid"> ${posts.map((post) => renderTemplate`${renderComponent($$result2, "PostCard", $$PostCard, { "post": post })}`)} </section> </div> ` })}`;
}, "/workspaces/Grandpa-Website/src/pages/library/[category]/index.astro", void 0);

const $$file = "/workspaces/Grandpa-Website/src/pages/library/[category]/index.astro";
const $$url = "/library/[category]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
