import { g as getLegacyPostBySlug, n as normalizeLegacyHtml, d as dedupeLegacyPosts, a as allLegacyPosts, b as getLegacyCategoryPosts, c as getLegacyPageBySlug } from './content_CZ0DdAXs.mjs';
import { i as isAppwriteConfigured, c as createAdminServices, g as getAppwriteConfig } from './appwrite_zKstY23-.mjs';
import { Query } from 'node-appwrite';

function normalizeRecord(record) {
  const data = record?.data ?? record ?? {};
  const sourcePath = data.legacySourcePath ?? data.legacyUrl ?? "";
  return {
    $id: record?.$id ?? data.$id ?? "",
    slug: data.slug ?? "",
    title: data.title ?? "",
    category: data.category ?? "",
    categoryLabel: data.categoryLabel ?? data.category ?? "",
    excerpt: data.excerpt ?? "",
    contentHtml: normalizeLegacyHtml(data.contentHtml ?? "", sourcePath),
    coverImage: data.coverImage ?? null,
    status: data.status ?? "published",
    publishedAt: data.publishedAt ?? null,
    archivedAt: data.archivedAt ?? null,
    legacySourcePath: data.legacySourcePath ?? null,
    legacyUrl: data.legacyUrl ?? null,
    sortOrder: data.sortOrder ?? 0,
    createdAt: record?.$createdAt ?? data.createdAt ?? "",
    updatedAt: record?.$updatedAt ?? data.updatedAt ?? ""
  };
}
function dedupePosts(posts) {
  const bySlug = /* @__PURE__ */ new Map();
  for (const post of posts) {
    const existing = bySlug.get(post.slug);
    if (!existing) {
      bySlug.set(post.slug, post);
      continue;
    }
    const candidateDepth = post.legacySourcePath?.split("/").filter(Boolean).length ?? 0;
    const currentDepth = existing.legacySourcePath?.split("/").filter(Boolean).length ?? 0;
    if (candidateDepth < currentDepth) {
      bySlug.set(post.slug, post);
      continue;
    }
    if (candidateDepth === currentDepth) {
      const candidateCategoryDepth = post.category.split("/").filter(Boolean).length;
      const currentCategoryDepth = existing.category.split("/").filter(Boolean).length;
      if (candidateCategoryDepth < currentCategoryDepth) {
        bySlug.set(post.slug, post);
      }
    }
  }
  return [...bySlug.values()];
}
async function getAllPosts() {
  if (!isAppwriteConfigured()) {
    return getLegacyCategoryPostsFallback();
  }
  try {
    const { databases } = createAdminServices();
    const { databaseId, tableId } = getAppwriteConfig();
    const result = await databases.listRows({
      databaseId,
      tableId,
      queries: [Query.orderDesc("publishedAt"), Query.orderDesc("$createdAt")]
    });
    return dedupePosts(result.rows.map(normalizeRecord));
  } catch {
    return getLegacyCategoryPostsFallback();
  }
}
async function getPublishedPosts() {
  const posts = await getAllPosts();
  return posts.filter((post) => post.status === "published");
}
async function getLatestPosts(limit = 4) {
  const posts = await getPublishedPosts();
  return posts.slice().sort((a, b) => {
    const aPublished = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const bPublished = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    if (aPublished !== bPublished) {
      return bPublished - aPublished;
    }
    const aCreated = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bCreated = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    if (aCreated !== bCreated) {
      return bCreated - aCreated;
    }
    return a.title.localeCompare(b.title);
  }).slice(0, limit);
}
async function getPostsForCategory(category) {
  const posts = await getAllPosts();
  const filtered = posts.filter((post) => post.category === category && post.status !== "archived");
  if (filtered.length > 0) {
    return filtered;
  }
  return getLegacyCategoryPosts(category).map((post) => ({ ...post, $id: post.slug, status: "published" }));
}
async function getAllIncludingArchived() {
  const posts = await getAllPosts();
  if (posts.length > 0) {
    return posts;
  }
  return getLegacyCategoryPostsFallback();
}
async function getPostBySlug(slug) {
  if (isAppwriteConfigured()) {
    try {
      const { databases } = createAdminServices();
      const { databaseId, tableId } = getAppwriteConfig();
      const result = await databases.listRows({
        databaseId,
        tableId,
        queries: [Query.equal("slug", slug), Query.limit(1)]
      });
      if (result.rows[0]) {
        return normalizeRecord(result.rows[0]);
      }
    } catch {
    }
  }
  const legacy = getLegacyPostBySlug(slug);
  if (legacy) {
    return {
      $id: legacy.slug,
      slug: legacy.slug,
      title: legacy.title,
      category: legacy.category,
      categoryLabel: legacy.categoryLabel,
      excerpt: legacy.excerpt,
      contentHtml: legacy.contentHtml,
      coverImage: legacy.coverImage ?? null,
      status: "published",
      publishedAt: legacy.publishedAt ?? null,
      archivedAt: legacy.archivedAt ?? null,
      legacySourcePath: legacy.sourcePath,
      legacyUrl: legacy.legacyUrl ?? null,
      sortOrder: legacy.sortOrder ?? 0
    };
  }
  return null;
}
async function getPostByCategoryAndSlug(category, slug) {
  const post = await getPostBySlug(slug);
  if (post && (post.category === category || !post.category || !category)) {
    return post;
  }
  return null;
}
async function getPageBySlug(slug) {
  const legacy = getLegacyPageBySlug(slug);
  if (legacy) {
    return legacy;
  }
  return null;
}
function getLegacyCategoryPostsFallback() {
  return dedupeLegacyPosts(allLegacyPosts()).map((post) => ({
    ...post,
    $id: post.slug,
    status: post.status ?? "published"
  }));
}
function getCanonicalPostPath(post) {
  const overrides = {
    "every-day-is-thanksgiving": "/library/my-book/every-day-is-thanksgiving/"
  };
  return overrides[post.slug] ?? `/library/${post.category}/${post.slug}/`;
}

export { getCanonicalPostPath as a, getAllIncludingArchived as b, getPostByCategoryAndSlug as c, getPostsForCategory as d, getPublishedPosts as e, getPageBySlug as f, getPostBySlug as g, getLatestPosts as h };
