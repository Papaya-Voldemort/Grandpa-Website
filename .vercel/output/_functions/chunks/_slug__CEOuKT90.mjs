import { c as createComponent } from './astro-component_BhUZwqY9.mjs';
import 'piccolore';
import { l as renderComponent, r as renderTemplate, m as maybeRenderHead, h as addAttribute } from './entrypoint_BjHBL06r.mjs';
import { $ as $$BaseLayout } from './BaseLayout_BJkAhuu4.mjs';
import { R as RichTextEditor } from './RichTextEditor_BYnkHApM.mjs';
import { r as requireAdminSession } from './auth_EJspuftz.mjs';
import { c as categories } from './categories_Z_vDg2NH.mjs';
import { g as getPostBySlug, a as getCanonicalPostPath } from './posts-server_B9fCINhK.mjs';

const prerender = false;
const $$slug = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$slug;
  const session = await requireAdminSession(Astro2.cookies);
  if (!session) {
    return Astro2.redirect("/admin/login/", 302);
  }
  const slug = Astro2.params.slug ?? "";
  const post = await getPostBySlug(slug);
  const selectedCategory = categories.find((category) => category.slug === post?.category) ?? categories[0];
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": `Editing: ${post?.title ?? "Post"} | Stephen M. Bird`, "pageClass": "admin-editor", "showSidebar": false }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="panel" style="max-width: 800px; margin: 0 auto; padding: 2rem;"> <h1 style="font-size: 2.5rem; color: #252161; margin-bottom: 0.5rem;">${post ? "Edit Post" : "New Post"}</h1> <p style="font-size: 1.2rem; color: #555; margin-bottom: 2rem;">Make any changes you need, then click the big green save button!</p> <form class="form-grid card" method="post" action="/api/posts/save" style="background-color: #fff; padding: 2rem; border-radius: 8px; border: 2px solid #fbb51a; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"> <input type="hidden" name="originalSlug"${addAttribute(post?.slug ?? "", "value")}> <div style="margin-bottom: 1.5rem;"> <label style="display: block; font-size: 1.5rem; font-weight: bold; color: #252161; margin-bottom: 0.5rem;">
1. Title
</label> <input type="text" name="title"${addAttribute(post?.title ?? "", "value")} required style="width: 100%; padding: 1rem; font-size: 1.2rem; border: 1px solid #ccc; border-radius: 4px;"> </div> <div style="margin-bottom: 1.5rem;"> <label style="display: block; font-size: 1.5rem; font-weight: bold; color: #252161; margin-bottom: 0.5rem;">
2. Category
</label> <select name="category" required style="width: 100%; padding: 1rem; font-size: 1.2rem; border: 1px solid #ccc; border-radius: 4px; background-color: #f9f9f9;"> ${categories.map((category) => renderTemplate`<option${addAttribute(category.slug, "value")}${addAttribute(category.slug === post?.category, "selected")}> ${category.label} </option>`)} </select> </div> <div style="margin-bottom: 2rem;"> <label style="display: block; font-size: 1.5rem; font-weight: bold; color: #252161; margin-bottom: 0.5rem;">
3. Content
</label> <div style="border: 1px solid #ccc; border-radius: 4px;"> ${renderComponent($$result2, "RichTextEditor", RichTextEditor, { "client:load": true, "initialContent": post?.contentHtml || "<p>Write the post here.</p>", "client:component-hydration": "load", "client:component-path": "/workspaces/Grandpa-Website/src/components/RichTextEditor", "client:component-export": "default" })} </div> </div> <input type="hidden" name="status"${addAttribute(post?.status || "published", "value")}> <div style="display: flex; gap: 1rem; flex-wrap: wrap;"> <button type="submit" style="flex: 2; background-color: #4CAF50; color: white; border: none; padding: 15px 30px; font-size: 1.5rem; font-weight: bold; border-radius: 8px; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.2); transition: background-color 0.2s;">
✅ Save Changes ✅
</button> <a${addAttribute(post ? getCanonicalPostPath(post) : `/library/${selectedCategory.slug}/${slug}/`, "href")} style="flex: 1; text-align: center; display: inline-block; background-color: #252161; color: white; border: none; padding: 15px 30px; font-size: 1.2rem; font-weight: bold; border-radius: 8px; text-decoration: none; box-shadow: 0 4px 6px rgba(0,0,0,0.2);">
👀 View Page
</a> </div> <details style="margin-top: 3rem; background-color: #f5f5f5; padding: 1rem; border-radius: 4px;"> <summary style="font-size: 1.1rem; color: #666; cursor: pointer;">Advanced Geeky Settings (You can ignore this!)</summary> <div style="margin-top: 1rem; opacity: 0.8; display: flex; flex-direction: column; gap: 0.5rem;"> <label>Cover image URL <input type="url" name="coverImage"${addAttribute(post?.coverImage ?? "", "value")}></label> <label>Status
<select name="status_advanced" onchange="this.form.status.value = this.value"> <option value="draft"${addAttribute(post?.status === "draft", "selected")}>Draft</option> <option value="published"${addAttribute(post?.status === "published", "selected")}>Published</option> <option value="archived"${addAttribute(post?.status === "archived", "selected")}>Archived</option> </select> </label> <label>Excerpt (Short summary) <textarea name="excerpt">${post?.excerpt ?? ""}</textarea></label> <label>Custom Link (Slug) <input type="text" name="slug"${addAttribute(post?.slug ?? slug, "value")}></label> <label>Category label override <input type="text" name="categoryLabel"${addAttribute(post?.categoryLabel ?? "", "value")}></label> <label>Legacy source path <input type="text" name="legacySourcePath"${addAttribute(post?.legacySourcePath ?? "", "value")}></label> <label>Legacy URL <input type="url" name="legacyUrl"${addAttribute(post?.legacyUrl ?? "", "value")}></label> <label>Sort order <input type="number" name="sortOrder"${addAttribute(post?.sortOrder ?? 0, "value")}></label> <label>Published at <input type="datetime-local" name="publishedAt"${addAttribute(post?.publishedAt ? new Date(post.publishedAt).toISOString().slice(0, 16) : "", "value")}></label> <label>Archived at <input type="datetime-local" name="archivedAt"${addAttribute(post?.archivedAt ? new Date(post.archivedAt).toISOString().slice(0, 16) : "", "value")}></label> </div> </details> </form> ${post ? renderTemplate`<div class="card" style="margin-top: 2rem; background-color: #fff0f0; border: 1px solid #ffcdd2; border-radius: 8px; padding: 1.5rem; display: flex; gap: 1rem; align-items: center;"> <div style="flex: 1;"> <h3 style="margin-top: 0; color: #c62828;">Danger Zone</h3> <p style="margin: 0; color: #b71c1c;">Only use if you want to hide or permanently remove this post.</p> </div> <form method="post" action="/api/posts/archive"> <input type="hidden" name="slug"${addAttribute(post.slug, "value")}> <input type="hidden" name="archived"${addAttribute(post.status !== "archived" ? "true" : "false", "value")}> <button type="submit" style="padding: 10px 20px; border-radius: 4px; border: 1px solid #757575; background: #e0e0e0; cursor: pointer;"> ${post.status === "archived" ? "Unarchive" : "Archive"} </button> </form> <form method="post" action="/api/posts/delete" onsubmit="return confirm('Delete this post permanently? This cannot be undone!');"> <input type="hidden" name="slug"${addAttribute(post.slug, "value")}> <button type="submit" style="padding: 10px 20px; border-radius: 4px; border: 1px solid #c62828; background: #ffebee; color: #c62828; cursor: pointer;">
Delete Post
</button> </form> </div>` : null} </div> ` })}`;
}, "/workspaces/Grandpa-Website/src/pages/admin/posts/[slug].astro", void 0);

const $$file = "/workspaces/Grandpa-Website/src/pages/admin/posts/[slug].astro";
const $$url = "/admin/posts/[slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$slug,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
