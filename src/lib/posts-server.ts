import { allLegacyPosts, getLegacyCategoryPosts, getLegacyPageBySlug, getLegacyPostBySlug } from "./content";
import { createAdminServices, Query } from "./appwrite";
import { getAppwriteConfig, isAppwriteConfigured } from "./env";
import type { PostRecord, SitePage } from "./types";

function normalizeRecord(record: any): PostRecord {
  const data = record?.data ?? record ?? {};
  return {
    $id: record?.$id ?? data.$id ?? "",
    slug: data.slug ?? "",
    title: data.title ?? "",
    category: data.category ?? "",
    categoryLabel: data.categoryLabel ?? data.category ?? "",
    excerpt: data.excerpt ?? "",
    contentHtml: data.contentHtml ?? "",
    coverImage: data.coverImage ?? null,
    status: (data.status ?? "published") as PostRecord["status"],
    publishedAt: data.publishedAt ?? null,
    archivedAt: data.archivedAt ?? null,
    legacySourcePath: data.legacySourcePath ?? null,
    legacyUrl: data.legacyUrl ?? null,
    sortOrder: data.sortOrder ?? 0,
    createdAt: record?.$createdAt ?? data.createdAt ?? "",
    updatedAt: record?.$updatedAt ?? data.updatedAt ?? "",
  };
}

export async function getAllPosts() {
  if (!isAppwriteConfigured()) {
    return getLegacyCategoryPostsFallback();
  }

  try {
    const { databases } = createAdminServices();
    const { databaseId, tableId } = getAppwriteConfig();
    const result = await databases.listRows({
      databaseId,
      tableId,
      queries: [Query.orderDesc("publishedAt"), Query.orderDesc("$createdAt")],
    });
    return result.rows.map(normalizeRecord);
  } catch {
    return getLegacyCategoryPostsFallback();
  }
}

export async function getPublishedPosts() {
  const posts = await getAllPosts();
  return posts.filter((post) => post.status === "published");
}

export async function getPostsForCategory(category: string) {
  const posts = await getAllPosts();
  const filtered = posts.filter((post) => post.category === category && post.status !== "archived");
  if (filtered.length > 0) {
    return filtered;
  }
  return getLegacyCategoryPosts(category).map((post) => ({ ...post, $id: post.slug, status: "published" as const }));
}

export async function getAllIncludingArchived() {
  const posts = await getAllPosts();
  if (posts.length > 0) {
    return posts;
  }
  return getLegacyCategoryPostsFallback();
}

export async function getPostBySlug(slug: string) {
  if (isAppwriteConfigured()) {
    try {
      const { databases } = createAdminServices();
      const { databaseId, tableId } = getAppwriteConfig();
      const result = await databases.listRows({
        databaseId,
        tableId,
        queries: [Query.equal("slug", slug), Query.limit(1)],
      });
      if (result.rows[0]) {
        return normalizeRecord(result.rows[0]);
      }
    } catch {
      // Fall through to legacy content.
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
      status: "published" as const,
      publishedAt: legacy.publishedAt ?? null,
      archivedAt: legacy.archivedAt ?? null,
      legacySourcePath: legacy.sourcePath,
      legacyUrl: legacy.legacyUrl ?? null,
      sortOrder: legacy.sortOrder ?? 0,
    };
  }

  return null;
}

export async function getPostByCategoryAndSlug(category: string, slug: string) {
  const post = await getPostBySlug(slug);
  if (post && (post.category === category || !post.category || !category)) {
    return post;
  }

  return null;
}

export async function getPageBySlug(slug: string): Promise<SitePage | null> {
  const legacy = getLegacyPageBySlug(slug);
  if (legacy) {
    return legacy;
  }

  return null;
}

export function getLegacyCategoryPostsFallback() {
  return allLegacyPosts().map((post) => ({
    ...post,
    $id: post.slug,
    status: post.status ?? "published",
  }));
}

export function getLegacyRedirectTarget(pathname: string) {
  const clean = pathname.replace(/^\/+/, "").replace(/\/+$/, "");
  if (!clean.endsWith(".html")) {
    return null;
  }

  const withoutExtension = clean.replace(/\.html$/, "");

  if (withoutExtension === "index") {
    return "/";
  }

  if (withoutExtension.endsWith("/index")) {
    return `/${withoutExtension.replace(/\/index$/, "/")}`;
  }

  return `/${withoutExtension}/`;
}
