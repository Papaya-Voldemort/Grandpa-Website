import { c as createComponent } from './astro-component_B70esp_X.mjs';
import 'piccolore';
import { l as renderComponent, r as renderTemplate, m as maybeRenderHead } from './entrypoint_CRcM7-3f.mjs';
import { $ as $$BaseLayout } from './BaseLayout_QBuS1F1d.mjs';

const $$404 = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Not Found | Stephen M. Bird", "pageClass": "not-found", "showSidebar": false }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="panel"> <h1>Page Not Found</h1> <p>The page you were looking for could not be found. If this used to be an old \`.html\` link, the migration may still be in progress.</p> <p><a class="action-button" href="/">Return Home</a></p> </div> ` })}`;
}, "/workspaces/Grandpa-Website/src/pages/404.astro", void 0);

const $$file = "/workspaces/Grandpa-Website/src/pages/404.astro";
const $$url = "/404";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$404,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
