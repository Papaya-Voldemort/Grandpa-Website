import { c as createComponent } from './astro-component_B70esp_X.mjs';
import 'piccolore';
import { l as renderComponent, r as renderTemplate, m as maybeRenderHead, h as addAttribute } from './entrypoint_CRcM7-3f.mjs';
import { $ as $$BaseLayout } from './BaseLayout_QBuS1F1d.mjs';
import { R as RichTextEditor } from './RichTextEditor_BYnkHApM.mjs';
import { r as requireAdminSession } from './auth_EJspuftz.mjs';
import { c as categories } from './categories_Z_vDg2NH.mjs';

const prerender = false;
const $$New = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$New;
  const session = await requireAdminSession(Astro2.cookies);
  if (!session) {
    return Astro2.redirect("/admin/login/", 302);
  }
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "New Post | Stephen M. Bird", "pageClass": "admin-editor", "showSidebar": false }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="panel" style="max-width: 800px; margin: 0 auto; padding: 2rem;"> <h1 style="font-size: 2.5rem; color: #252161; margin-bottom: 0.5rem;">Write a New Post</h1> <p style="font-size: 1.2rem; color: #555; margin-bottom: 2rem;">Fill in the title, pick a category, write your thoughts, and click save!</p> <form class="form-grid card" method="post" action="/api/posts/save" style="background-color: #fff; padding: 2rem; border-radius: 8px; border: 2px solid #fbb51a; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"> <div style="margin-bottom: 1.5rem;"> <label style="display: block; font-size: 1.5rem; font-weight: bold; color: #252161; margin-bottom: 0.5rem;">
1. What's the title?
</label> <input type="text" name="title" required placeholder="Type the title of your post here..." style="width: 100%; padding: 1rem; font-size: 1.2rem; border: 1px solid #ccc; border-radius: 4px;"> </div> <div style="margin-bottom: 1.5rem;"> <label style="display: block; font-size: 1.5rem; font-weight: bold; color: #252161; margin-bottom: 0.5rem;">
2. Which category does this belong to?
</label> <select name="category" required style="width: 100%; padding: 1rem; font-size: 1.2rem; border: 1px solid #ccc; border-radius: 4px; background-color: #f9f9f9;"> <option value="">-- Click to choose a category --</option> ${categories.map((category) => renderTemplate`<option${addAttribute(category.slug, "value")}>${category.label}</option>`)} </select> </div> <div style="margin-bottom: 2rem;"> <label style="display: block; font-size: 1.5rem; font-weight: bold; color: #252161; margin-bottom: 0.5rem;">
3. Write your post below:
</label> <div style="border: 1px solid #ccc; border-radius: 4px;"> ${renderComponent($$result2, "RichTextEditor", RichTextEditor, { "client:load": true, "initialContent": "<p>Start typing your post here...</p>", "client:component-hydration": "load", "client:component-path": "/workspaces/Grandpa-Website/src/components/RichTextEditor", "client:component-export": "default" })} </div> </div> <input type="hidden" name="status" value="published"> <button type="submit" style="background-color: #252161; color: white; border: none; padding: 15px 30px; font-size: 1.5rem; font-weight: bold; border-radius: 8px; cursor: pointer; width: 100%; box-shadow: 0 4px 6px rgba(0,0,0,0.2); transition: background-color 0.2s;">
⭐ Publish Post ⭐
</button> <details style="margin-top: 3rem; background-color: #f5f5f5; padding: 1rem; border-radius: 4px;"> <summary style="font-size: 1.1rem; color: #666; cursor: pointer;">Advanced Geeky Settings (You can ignore this!)</summary> <div style="margin-top: 1rem; opacity: 0.8;"> <label>Cover image URL <input type="url" name="coverImage" placeholder="/images/example.jpg or https://..."></label> <label>Status
<select name="status_advanced" onchange="this.form.status.value = this.value"> <option value="published">Published</option> <option value="draft">Draft</option> <option value="archived">Archived</option> </select> </label> <label>Excerpt (Short summary) <textarea name="excerpt"></textarea></label> <label>Custom Link (Slug) <input type="text" name="slug" placeholder="Auto-generated if blank"></label> <label>Category label override <input type="text" name="categoryLabel"></label> <label>Legacy source path <input type="text" name="legacySourcePath"></label> <label>Legacy URL <input type="url" name="legacyUrl"></label> <label>Sort order <input type="number" name="sortOrder" value="0"></label> <label>Published at <input type="datetime-local" name="publishedAt"></label> <label>Archived at <input type="datetime-local" name="archivedAt"></label> </div> </details> </form> </div> ` })}`;
}, "/workspaces/Grandpa-Website/src/pages/admin/posts/new.astro", void 0);

const $$file = "/workspaces/Grandpa-Website/src/pages/admin/posts/new.astro";
const $$url = "/admin/posts/new";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$New,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
