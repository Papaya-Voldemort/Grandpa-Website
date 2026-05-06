import { c as createComponent } from './astro-component_B70esp_X.mjs';
import 'piccolore';
import './entrypoint_CRcM7-3f.mjs';
import 'clsx';

const prerender = false;
const $$ = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$;
  const raw = Astro2.params.legacy ?? "";
  const pathname = Array.isArray(raw) ? raw.join("/") : raw;
  function redirectTarget(input) {
    const clean = input.replace(/^\/+/, "");
    if (!clean.endsWith(".html")) {
      return null;
    }
    const withoutExt = clean.slice(0, -5);
    if (withoutExt === "index") {
      return "/";
    }
    if (withoutExt.endsWith("/index")) {
      return `/${withoutExt.slice(0, -6)}/`;
    }
    return `/${withoutExt}/`;
  }
  const target = redirectTarget(pathname);
  if (!target) {
    return new Response("Not found", { status: 404 });
  }
  return Astro2.redirect(target, 301);
}, "/workspaces/Grandpa-Website/src/pages/[...legacy].astro", void 0);

const $$file = "/workspaces/Grandpa-Website/src/pages/[...legacy].astro";
const $$url = "/[...legacy]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
