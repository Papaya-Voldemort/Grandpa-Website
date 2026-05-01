import { c as createComponent } from './astro-component_BhUZwqY9.mjs';
import 'piccolore';
import { l as renderComponent, r as renderTemplate, m as maybeRenderHead } from './entrypoint_BjHBL06r.mjs';
import { $ as $$BaseLayout } from './BaseLayout_BJkAhuu4.mjs';
import { $ as $$PostCard } from './PostCard_C8FR3mf3.mjs';
import { b as getAllIncludingArchived } from './posts-server_B9fCINhK.mjs';

const prerender = false;
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const posts = await getAllIncludingArchived();
  const visible = posts.filter((post) => post.status !== "archived");
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Archives | Stephen M. Bird", "description": "Browse the article archive." }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="panel"> <h1>Archives</h1> <p>Browse the full collection of articles, grouped in the same familiar categories.</p> <section class="post-grid"> ${visible.map((post) => renderTemplate`${renderComponent($$result2, "PostCard", $$PostCard, { "post": post })}`)} </section> </div> ` })}`;
}, "/workspaces/Grandpa-Website/src/pages/library/archives/index.astro", void 0);

const $$file = "/workspaces/Grandpa-Website/src/pages/library/archives/index.astro";
const $$url = "/library/archives";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
