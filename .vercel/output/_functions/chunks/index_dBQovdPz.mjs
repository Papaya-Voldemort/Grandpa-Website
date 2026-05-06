import { c as createComponent } from './astro-component_B70esp_X.mjs';
import 'piccolore';
import { l as renderComponent, r as renderTemplate, m as maybeRenderHead, h as addAttribute, u as unescapeHTML } from './entrypoint_CRcM7-3f.mjs';
import { $ as $$BaseLayout } from './BaseLayout_QBuS1F1d.mjs';
import { $ as $$PostCard } from './PostCard_CHBNoMFN.mjs';
import { g as getCategoryInfo } from './categories_Z_vDg2NH.mjs';
import { g as getCurrentSession } from './auth_EJspuftz.mjs';
import { c as getPostByCategoryAndSlug, d as getPostsForCategory, g as getPostBySlug, a as getCanonicalPostPath } from './posts-server_B9fCINhK.mjs';

const prerender = false;
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Index;
  const category = Astro2.params.category ?? "";
  const slug = Astro2.params.slug ?? "";
  const exactPost = await getPostByCategoryAndSlug(category, slug);
  const nestedCategory = `${category}/${slug}`;
  const nestedPosts = exactPost ? [] : await getPostsForCategory(nestedCategory);
  const nestedInfo = getCategoryInfo(nestedCategory);
  const session = await getCurrentSession(Astro2.cookies);
  if (!exactPost && nestedPosts.length === 0) {
    const fallback = await getPostBySlug(slug);
    if (fallback) {
      return Astro2.redirect(getCanonicalPostPath(fallback), 301);
    }
    return new Response("Not found", { status: 404 });
  }
  const info = getCategoryInfo(category);
  return renderTemplate`${exactPost ? renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": `${exactPost.title} | Stephen M. Bird`, "description": exactPost.excerpt, "pageClass": `post-${slug}` }, { "default": async ($$result2) => renderTemplate`${session && exactPost.$id && renderTemplate`${maybeRenderHead()}<div style="margin: 1rem 0; padding: 1rem; background-color: #fef4dd; border: 1px solid #fbb51a; border-radius: 4px; display: flex; justify-content: space-between; align-items: center;"><strong style="color: #252161;">You are logged in as Admin.</strong><a${addAttribute(`/admin/posts/${exactPost.$id}`, "href")} class="admin-callout">EDIT THIS POST</a></div>`}<div class="panel legacy-body"><img${addAttribute(info.headerImage, "src")}${addAttribute(info.label, "alt")}><h1>${exactPost.title}</h1><p class="meta">${info.label}${exactPost.publishedAt ? ` · ${new Date(exactPost.publishedAt).toLocaleDateString("en-US")}` : ""}</p><article class="article-body">${unescapeHTML(exactPost.contentHtml)}</article></div>` })}` : renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": `${nestedInfo.label} | Stephen M. Bird`, "description": nestedInfo.intro, "pageClass": `category-${nestedCategory}` }, { "default": async ($$result2) => renderTemplate`<div class="panel"><img${addAttribute(nestedInfo.headerImage, "src")}${addAttribute(nestedInfo.label, "alt")}><h1>${nestedInfo.label}</h1><p>${nestedInfo.intro}</p><section class="post-grid">${nestedPosts.map((nestedPost) => renderTemplate`${renderComponent($$result2, "PostCard", $$PostCard, { "post": nestedPost })}`)}</section></div>` })}`}`;
}, "/workspaces/Grandpa-Website/src/pages/library/[category]/[slug]/index.astro", void 0);

const $$file = "/workspaces/Grandpa-Website/src/pages/library/[category]/[slug]/index.astro";
const $$url = "/library/[category]/[slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
