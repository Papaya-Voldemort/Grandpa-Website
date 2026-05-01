import { c as createComponent } from './astro-component_BhUZwqY9.mjs';
import 'piccolore';
import './entrypoint_BjHBL06r.mjs';
import 'clsx';
import { g as getPostBySlug, a as getCanonicalPostPath, c as getPostByCategoryAndSlug } from './posts-server_B9fCINhK.mjs';

const prerender = false;
const $$ = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$;
  const raw = Astro2.params.segments ?? [];
  const segments = Array.isArray(raw) ? raw : String(raw).split("/");
  const cleanSegments = segments.map((segment) => segment.trim()).filter(Boolean);
  if (cleanSegments.length === 0) {
    return new Response("Not found", { status: 404 });
  }
  const slug = cleanSegments[cleanSegments.length - 1];
  const category = cleanSegments.slice(0, -1).join("/");
  if (slug.endsWith(".html")) {
    const withoutExt = slug.slice(0, -5);
    const canonical = await getPostBySlug(withoutExt);
    if (canonical) {
      return Astro2.redirect(getCanonicalPostPath(canonical), 301);
    }
  }
  const exactPost = category ? await getPostByCategoryAndSlug(category, slug) : null;
  if (exactPost) {
    return Astro2.redirect(getCanonicalPostPath(exactPost), 301);
  }
  const fallback = await getPostBySlug(slug);
  if (fallback) {
    return Astro2.redirect(getCanonicalPostPath(fallback), 301);
  }
  return new Response("Not found", { status: 404 });
}, "/workspaces/Grandpa-Website/src/pages/library/[...segments].astro", void 0);

const $$file = "/workspaces/Grandpa-Website/src/pages/library/[...segments].astro";
const $$url = "/library/[...segments]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
