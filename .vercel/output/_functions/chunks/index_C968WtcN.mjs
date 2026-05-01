import { c as createComponent } from './astro-component_BhUZwqY9.mjs';
import 'piccolore';
import { l as renderComponent, r as renderTemplate, m as maybeRenderHead, h as addAttribute } from './entrypoint_BjHBL06r.mjs';
import { $ as $$BaseLayout } from './BaseLayout_BJkAhuu4.mjs';
import { e as getPublishedPosts, a as getCanonicalPostPath } from './posts-server_B9fCINhK.mjs';

const prerender = false;
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Index;
  const query = (Astro2.url.searchParams.get("q") ?? "").trim().toLowerCase();
  const posts = await getPublishedPosts();
  const results = query ? posts.filter((post) => {
    const haystack = [post.title, post.excerpt, post.categoryLabel, post.contentHtml].join(" ").toLowerCase();
    return haystack.includes(query);
  }) : [];
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Search | Stephen M. Bird", "description": "Search the site archive." }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="panel"> <h1>Search This Site</h1> <form class="site-search-form" action="/search/" method="get"> <input type="search" name="q"${addAttribute(query, "value")} placeholder="Search by title, phrase, or category"> <button type="submit">Search</button> </form> ${query ? renderTemplate`<p>${results.length} result(s) for <strong>${query}</strong>.</p>` : renderTemplate`<p>Search the archive by title or topic.</p>`} <div class="admin-list"> ${results.map((post) => renderTemplate`<article class="card"> <h3><a${addAttribute(getCanonicalPostPath(post), "href")}>${post.title}</a></h3> <p class="meta">${post.categoryLabel}</p> <p>${post.excerpt}</p> </article>`)} </div> </div> ` })}`;
}, "/workspaces/Grandpa-Website/src/pages/search/index.astro", void 0);

const $$file = "/workspaces/Grandpa-Website/src/pages/search/index.astro";
const $$url = "/search";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
