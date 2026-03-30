import path from "node:path";
import * as cheerio from "cheerio";
import legacyAliases from "../data/legacy-aliases.json";
import legacyPosts from "../data/legacy-content.json";
import legacyPages from "../data/legacy-pages.json";
import type { LegacyPost, SitePage } from "./types";

export const legacyPostsFallback = legacyPosts as LegacyPost[];
export const legacyPagesFallback = legacyPages as SitePage[];
const legacyAliasMap = legacyAliases as Record<string, string>;

function countSegments(value: string) {
  return value.split("/").filter(Boolean).length;
}

function isExternalUrl(value: string) {
  return /^(?:[a-z][a-z0-9+.-]*:|\/\/|#|mailto:|tel:|javascript:)/i.test(value);
}

function normalizePathCandidates(value: string, sourcePath?: string) {
  const candidates = new Set<string>();
  const trimmed = value.trim();
  const noQuery = trimmed.split(/[?#]/, 1)[0];

  candidates.add(trimmed);
  candidates.add(noQuery);
  candidates.add(noQuery.replace(/\/+$/, ""));
  candidates.add(noQuery.replace(/\.html$/, "/"));
  candidates.add(noQuery.replace(/\.html$/, ""));

  if (sourcePath && !isExternalUrl(trimmed) && !trimmed.startsWith("/")) {
    const baseDir = `/${path.posix.dirname(sourcePath)}/`;
    const resolved = path.posix.resolve(baseDir, noQuery);
    candidates.add(resolved);
    candidates.add(resolved.replace(/\/+$/, ""));
    candidates.add(resolved.replace(/\.html$/, "/"));
    candidates.add(resolved.replace(/\.html$/, ""));
  }

  return [...candidates].filter(Boolean);
}

export function resolveLegacyHref(href: string, sourcePath?: string) {
  if (!href || isExternalUrl(href)) {
    return href;
  }

  for (const candidate of normalizePathCandidates(href, sourcePath)) {
    const canonical = legacyAliasMap[candidate] ?? legacyAliasMap[candidate.replace(/\/+$/, "")];
    if (canonical) {
      return canonical;
    }
  }

  return href;
}

export function normalizeLegacyHtml(html: string, sourcePath?: string) {
  if (!html) {
    return html;
  }

  const $ = cheerio.load(html, { decodeEntities: false });
  $("[href], [src], [action]").each((_, element) => {
    for (const attr of ["href", "src", "action"] as const) {
      const value = $(element).attr(attr);
      if (!value) {
        continue;
      }

      const resolved = resolveLegacyHref(value, sourcePath);
      if (resolved !== value) {
        $(element).attr(attr, resolved);
      }
    }
  });

  return $("body").html() ?? html;
}

function normalizeLegacyPost<T extends { contentHtml: string; sourcePath?: string; legacySourcePath?: string; legacyUrl?: string }>(post: T) {
  return {
    ...post,
    contentHtml: normalizeLegacyHtml(post.contentHtml, post.sourcePath ?? post.legacySourcePath ?? post.legacyUrl ?? ""),
  };
}

function prefersCanonicalPost(candidate: LegacyPost, current: LegacyPost) {
  const candidatePathDepth = countSegments(candidate.sourcePath);
  const currentPathDepth = countSegments(current.sourcePath);
  if (candidatePathDepth !== currentPathDepth) {
    return candidatePathDepth < currentPathDepth;
  }

  const candidateCategoryDepth = countSegments(candidate.category);
  const currentCategoryDepth = countSegments(current.category);
  if (candidateCategoryDepth !== currentCategoryDepth) {
    return candidateCategoryDepth < currentCategoryDepth;
  }

  const candidateLegacyDepth = countSegments(candidate.legacyUrl ?? "");
  const currentLegacyDepth = countSegments(current.legacyUrl ?? "");
  if (candidateLegacyDepth !== currentLegacyDepth) {
    return candidateLegacyDepth < currentLegacyDepth;
  }

  return candidate.title.localeCompare(current.title) < 0;
}

export function dedupeLegacyPosts(posts: LegacyPost[]) {
  const bySlug = new Map<string, LegacyPost>();
  for (const post of posts) {
    const existing = bySlug.get(post.slug);
    if (!existing || prefersCanonicalPost(post, existing)) {
      bySlug.set(post.slug, post);
    }
  }

  return [...bySlug.values()];
}

export function getLegacyPostBySlug(slug: string) {
  const post = dedupeLegacyPosts(legacyPostsFallback).find((entry) => entry.slug === slug) ?? null;
  return post ? normalizeLegacyPost(post) : null;
}

export function getLegacyPageBySlug(slug: string) {
  const page = legacyPagesFallback.find((entry) => entry.slug === slug) ?? null;
  return page ? { ...page, contentHtml: normalizeLegacyHtml(page.contentHtml, page.sourcePath) } : null;
}

export function getLegacyCategoryPosts(category: string) {
  return dedupeLegacyPosts(legacyPostsFallback)
    .filter((post) => post.category === category)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.title.localeCompare(b.title));
}

export function allLegacyPosts() {
  return dedupeLegacyPosts(legacyPostsFallback)
    .map((post) => normalizeLegacyPost(post))
    .sort((a, b) => {
      const aTime = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const bTime = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return bTime - aTime || a.title.localeCompare(b.title);
    });
}
