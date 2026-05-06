import { c as createComponent } from './astro-component_B70esp_X.mjs';
import 'piccolore';
import { l as renderComponent, r as renderTemplate, m as maybeRenderHead, h as addAttribute, n as Fragment } from './entrypoint_CRcM7-3f.mjs';
import { $ as $$BaseLayout } from './BaseLayout_QBuS1F1d.mjs';
import { h as getLatestPosts, a as getCanonicalPostPath } from './posts-server_B9fCINhK.mjs';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const latestPosts = await getLatestPosts(4);
  const hero = latestPosts[0];
  const left = latestPosts[1];
  const middle = latestPosts[2];
  const right = latestPosts[3];
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Stephen M. Bird | Prayers | Miracles | Family | Marriage | Happiness", "containerId": "home-page" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<section class="article top"> <div class="topImage"> <img${addAttribute(hero?.coverImage ?? "/images/cornucopia.jpg", "src")}${addAttribute(hero?.title ?? "Every Day Is Thanksgiving", "alt")}> </div> <div class="topContent"> <h1>${hero?.title ?? "Every Day Is Thanksgiving"}</h1> <h3> ${hero?.categoryLabel ?? "Featured Story"} ${hero?.publishedAt ? ` · ${new Date(hero.publishedAt).toLocaleDateString("en-US")}` : ""} </h3> <p>${hero?.excerpt ?? "Faith, gratitude, family, and miracles in everyday life."}</p> ${hero ? renderTemplate`<p><a${addAttribute(getCanonicalPostPath(hero), "href")}>Read More &raquo;</a></p>` : null} </div> </section> <div class="clear"></div> <section class="article left"> ${left ? renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate` <h2><a${addAttribute(getCanonicalPostPath(left), "href")}>${left.title}</a></h2> <h3>${left.categoryLabel}${left.publishedAt ? ` · ${new Date(left.publishedAt).toLocaleDateString("en-US")}` : ""}</h3> <p>${left.excerpt}</p> <p><a${addAttribute(getCanonicalPostPath(left), "href")}>Read More &raquo;</a></p> ` })}` : null} </section> <section class="article middle"> ${middle ? renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate` <h2><a${addAttribute(getCanonicalPostPath(middle), "href")}>${middle.title}</a></h2> <h3>${middle.categoryLabel}${middle.publishedAt ? ` · ${new Date(middle.publishedAt).toLocaleDateString("en-US")}` : ""}</h3> <p>${middle.excerpt}</p> <p><a${addAttribute(getCanonicalPostPath(middle), "href")}>Read More &raquo;</a></p> ` })}` : null} </section> <section class="article right"> ${right ? renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate` <h2><a${addAttribute(getCanonicalPostPath(right), "href")}>${right.title}</a></h2> <h3>${right.categoryLabel}${right.publishedAt ? ` · ${new Date(right.publishedAt).toLocaleDateString("en-US")}` : ""}</h3> <p>${right.excerpt}</p> <p><a${addAttribute(getCanonicalPostPath(right), "href")}>Read More &raquo;</a></p> ` })}` : null} </section> <div class="clear"></div> <div class="browseButton"> <a href="/library/archives/" class="browseMore">Browse More Articles &raquo;</a> </div> ` })}`;
}, "/workspaces/Grandpa-Website/src/pages/index.astro", void 0);

const $$file = "/workspaces/Grandpa-Website/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
