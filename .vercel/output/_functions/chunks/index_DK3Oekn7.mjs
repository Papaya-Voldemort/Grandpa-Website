import { c as createComponent } from './astro-component_BhUZwqY9.mjs';
import 'piccolore';
import { l as renderComponent, r as renderTemplate, m as maybeRenderHead, h as addAttribute } from './entrypoint_BjHBL06r.mjs';
import { $ as $$BaseLayout } from './BaseLayout_BJkAhuu4.mjs';
import { r as requireAdminSession } from './auth_EJspuftz.mjs';
import { b as getAllIncludingArchived, a as getCanonicalPostPath } from './posts-server_B9fCINhK.mjs';

const prerender = false;
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Index;
  const session = await requireAdminSession(Astro2.cookies);
  if (!session) {
    return Astro2.redirect("/admin/login/", 302);
  }
  const posts = await getAllIncludingArchived();
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Post Maker | Stephen M. Bird", "pageClass": "admin-home", "showSidebar": false }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="panel"> <h1>Post Maker</h1> <p class="admin-notice">
Signed in as <strong>${session.email ?? session.userId}</strong>. Use this dashboard to create, edit, archive, or delete posts.
</p> <div class="admin-grid"> <div class="card"> <p><a class="action-button" href="/admin/posts/new/">Write a New Post</a></p> <form method="post" action="/api/admin/logout"> <button type="submit">Sign Out</button> </form> </div> <div class="admin-list"> ${posts.map((post) => renderTemplate`<article class="card"> <h3> <a${addAttribute(`/admin/posts/${post.slug}/`, "href")}>${post.title}</a> </h3> <p class="meta"> <span${addAttribute(`status-pill is-${post.status}`, "class")}>${post.status}</span> ${post.categoryLabel || post.category} </p> <p>${post.excerpt}</p> <p> <a${addAttribute(getCanonicalPostPath(post), "href")}>View Public Page</a> </p> </article>`)} </div> </div> </div> ` })}`;
}, "/workspaces/Grandpa-Website/src/pages/admin/index.astro", void 0);

const $$file = "/workspaces/Grandpa-Website/src/pages/admin/index.astro";
const $$url = "/admin";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
