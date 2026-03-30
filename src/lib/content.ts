import legacyPosts from "../data/legacy-content.json";
import legacyPages from "../data/legacy-pages.json";
import type { LegacyPost, SitePage } from "./types";

export const legacyPostsFallback = legacyPosts as LegacyPost[];
export const legacyPagesFallback = legacyPages as SitePage[];

export function getLegacyPostBySlug(slug: string) {
  return legacyPostsFallback.find((post) => post.slug === slug) ?? null;
}

export function getLegacyPageBySlug(slug: string) {
  return legacyPagesFallback.find((page) => page.slug === slug) ?? null;
}

export function getLegacyCategoryPosts(category: string) {
  return legacyPostsFallback
    .filter((post) => post.category === category)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.title.localeCompare(b.title));
}

export function allLegacyPosts() {
  return [...legacyPostsFallback].sort((a, b) => {
    const aTime = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const bTime = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return bTime - aTime || a.title.localeCompare(b.title);
  });
}
