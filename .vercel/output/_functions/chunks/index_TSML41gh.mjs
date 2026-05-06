import { c as createComponent } from './astro-component_B70esp_X.mjs';
import 'piccolore';
import './entrypoint_CRcM7-3f.mjs';
import 'clsx';

const prerender = false;
const $$Index = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Index;
  return Astro2.redirect("/prayers-that-bring-miracles/", 302);
}, "/workspaces/Grandpa-Website/src/pages/prayersthatbringmiracles/default/index.astro", void 0);

const $$file = "/workspaces/Grandpa-Website/src/pages/prayersthatbringmiracles/default/index.astro";
const $$url = "/prayersthatbringmiracles/default";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Index,
	file: $$file,
	prerender,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
