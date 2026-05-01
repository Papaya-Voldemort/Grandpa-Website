import { c as createComponent } from './astro-component_BhUZwqY9.mjs';
import 'piccolore';
import { m as maybeRenderHead, h as addAttribute, r as renderTemplate } from './entrypoint_BjHBL06r.mjs';
import 'clsx';
import { a as getCanonicalPostPath } from './posts-server_B9fCINhK.mjs';
import { g as getCurrentSession } from './auth_EJspuftz.mjs';

const $$PostCard = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$PostCard;
  const { post } = Astro2.props;
  const postPath = getCanonicalPostPath(post);
  const session = await getCurrentSession(Astro2.cookies);
  return renderTemplate`${maybeRenderHead()}<article class="card article-teaser" style="position: relative;"> ${session && post.$id && renderTemplate`<div style="position: absolute; top: 10px; right: 10px; z-index: 10;"> <a${addAttribute(`/admin/posts/${post.$id}`, "href")} class="admin-callout" style="text-decoration: none;">EDIT POST</a> </div>`} ${post.coverImage ? renderTemplate`<img${addAttribute(post.coverImage, "src")}${addAttribute(post.title, "alt")}>` : null} <h2><a${addAttribute(postPath, "href")}>${post.title}</a></h2> <p class="meta"> ${post.categoryLabel} ${post.publishedAt ? ` · ${new Date(post.publishedAt).toLocaleDateString("en-US")}` : ""} </p> <p>${post.excerpt}</p> <p><a${addAttribute(postPath, "href")}>Read More &raquo;</a></p> </article>`;
}, "/workspaces/Grandpa-Website/src/components/PostCard.astro", void 0);

export { $$PostCard as $ };
