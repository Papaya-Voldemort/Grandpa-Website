import fs from "node:fs/promises";
import path from "node:path";
import * as cheerio from "cheerio";

const root = path.resolve(process.cwd(), "public_html");
const outPosts = path.resolve(process.cwd(), "src/data/legacy-content.json");
const outPages = path.resolve(process.cwd(), "src/data/legacy-pages.json");
const outAliases = path.resolve(process.cwd(), "src/data/legacy-aliases.json");

const skipDirFragments = ["/staging/", "/scripts/", "/partials/", "/cgi-bin/"];
const pageSlugs = new Set([
  "about-me",
  "about-this-website",
  "contact",
  "new-book",
  "prayers-that-bring-miracles",
  "search",
  "email-form",
]);

const categoryLabels = new Map([
  ["inspirational-stories", "Inspirational Stories"],
  ["marriage-family", "Marriage & Family"],
  ["gospel-doctrine", "Gospel Doctrine"],
  ["financial-ark", "Financial Ark"],
  ["religion-society", "Religion & Society"],
  ["reading", "Reading"],
  ["my-book", "My Book"],
  ["archives", "Archives"],
]);

function isHtmlFile(file) {
  return file.endsWith(".html");
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
    } else if (isHtmlFile(fullPath)) {
      files.push(fullPath);
    }
  }
  return files;
}

function cleanText(value) {
  return value.replace(/\s+/g, " ").trim();
}

function segmentCount(value) {
  return value.split("/").filter(Boolean).length;
}

function prefersCanonicalRecord(candidate, current) {
  const candidateDepth = segmentCount(candidate.sourcePath);
  const currentDepth = segmentCount(current.sourcePath);
  if (candidateDepth !== currentDepth) {
    return candidateDepth < currentDepth;
  }

  const candidateCategoryDepth = segmentCount(candidate.category);
  const currentCategoryDepth = segmentCount(current.category);
  if (candidateCategoryDepth !== currentCategoryDepth) {
    return candidateCategoryDepth < currentCategoryDepth;
  }

  const candidateLegacyDepth = segmentCount(candidate.legacyUrl ?? "");
  const currentLegacyDepth = segmentCount(current.legacyUrl ?? "");
  if (candidateLegacyDepth !== currentLegacyDepth) {
    return candidateLegacyDepth < currentLegacyDepth;
  }

  return candidate.title.localeCompare(current.title) < 0;
}

function isExternalUrl(value) {
  return /^(?:[a-z][a-z0-9+.-]*:|\/\/|#|mailto:|tel:|javascript:)/i.test(value);
}

function normalizeCandidates(value, sourcePath) {
  const candidates = new Set();
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

function rewriteLegacyLinks(html, sourcePath, aliases) {
  const $ = cheerio.load(html, { decodeEntities: false });
  $("[href], [src], [action]").each((_, element) => {
    for (const attr of ["href", "src", "action"]) {
      const value = $(element).attr(attr);
      if (!value || isExternalUrl(value)) {
        continue;
      }

      for (const candidate of normalizeCandidates(value, sourcePath)) {
        const canonical = aliases.get(candidate) ?? aliases.get(candidate.replace(/\/+$/, ""));
        if (canonical && canonical !== value) {
          $(element).attr(attr, canonical);
          break;
        }
      }
    }
  });

  return $("body").html() ?? html;
}

function canonicalPathForRecord(record, canonicalRecord) {
  if (!record || !canonicalRecord) {
    return null;
  }

  if (record.slug !== canonicalRecord.slug) {
    return null;
  }

  return canonicalRecord.category ? `/library/${canonicalRecord.category}/${canonicalRecord.slug}/` : `/${canonicalRecord.slug}/`;
}

function humanizeSlug(slug) {
  return slug
    .split(/[-_]/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function findBestContainer($) {
  const selectors = [
    "section.article",
    "div.article",
    "div.content",
    "#sub-main",
    "#home-page",
    "main",
    "body",
  ];

  for (const selector of selectors) {
    const node = $(selector).first();
    if (node && cleanText(node.text()).length > 160) {
      return node;
    }
  }

  return $("body").first();
}

function extractPublishedAt(text) {
  const patterns = [
    /([A-Z][a-z]+ \d{1,2}, ?\d{4})/,
    /(\d{1,2} [A-Z][a-z]+ \d{4})/,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const date = new Date(match[1]);
      if (!Number.isNaN(date.getTime())) {
        return date.toISOString();
      }
    }
  }

  return null;
}

function extractTitle($, fallback) {
  const candidates = ["meta[property='og:title']", "title", "h1", "h2"];
  for (const selector of candidates) {
    const value =
      selector.startsWith("meta")
        ? $(selector).attr("content")
        : $(selector).first().text();
    const cleaned = cleanText(value ?? "");
    if (cleaned) {
      return cleaned.replace(/\s*\|\s*Stephen M\. Bird$/i, "");
    }
  }
  return fallback;
}

function extractMainHtml($) {
  const container = findBestContainer($).clone();
  container.find("script").remove();
  container.find("noscript").remove();
  container.find("iframe").each((_, el) => {
    const iframe = $(el);
    const src = iframe.attr("src") ?? "";
    iframe.replaceWith(
      `<p><a href="${src}" target="_blank" rel="noreferrer noopener">Embedded content</a></p>`,
    );
  });
  container.find("[data-include]").remove();
  container.find(".fb-comments").remove();
  container.find(".fb-like").remove();
  container.find(".twitterBtn").remove();
  container.find(".addthis_bar").remove();
  return container.html() ?? "";
}

function extractStandalonePageHtml($) {
  const page = $("#content-page").first();
  if (!page.length) {
    return extractMainHtml($);
  }

  const children = page.children().toArray();
  const startIndex = children.findIndex((node) => {
    const element = $(node);
    return element.is("#sub-main") || element.is("div.article") || element.is("div.content");
  });

  if (startIndex === -1) {
    return extractMainHtml($);
  }

  const fragments = [];
  for (let index = startIndex; index < children.length; index += 1) {
    const child = children[index];
    const element = $(child);
    if (element.hasClass("footer")) {
      break;
    }
    if (element.is("script") || element.is("noscript")) {
      continue;
    }
    fragments.push($.html(child));
  }

  return fragments.join("\n");
}

function extractExcerpt($, html) {
  const fragment = cheerio.load(`<div>${html}</div>`, { decodeEntities: false });
  const candidates = fragment("p, blockquote, li, h3, h2").toArray();
  for (const candidate of candidates) {
    const text = cleanText(fragment(candidate).text());
    if (text && text !== "Notes:") {
      return text.slice(0, 240);
    }
  }
  return "";
}

function getCategoryInfo(filePath) {
  const relative = path.relative(root, filePath).replaceAll(path.sep, "/");
  const segments = relative.split("/");
  const top = segments[0];

  if (top !== "library") {
    return { category: "", categoryLabel: "" };
  }

  const folderSegments = segments.slice(1, -1);
  if (folderSegments.length === 0) {
    return { category: "", categoryLabel: "" };
  }

  const category = folderSegments.join("/");
  const label = folderSegments
    .map((segment) => categoryLabels.get(segment) ?? humanizeSlug(segment))
    .join(" / ");
  return { category, categoryLabel: label };
}

function isLegacyPost(filePath) {
  const relative = path.relative(root, filePath).replaceAll(path.sep, "/");
  if (skipDirFragments.some((fragment) => relative.includes(fragment))) {
    return false;
  }

  if (relative.startsWith("library/")) {
    return !relative.endsWith("/index.html") && !relative.endsWith("archives/index.html");
  }

  return false;
}

function buildRecord(filePath, html) {
  const relative = path.relative(root, filePath).replaceAll(path.sep, "/");
  const base = path.basename(filePath, ".html");
  const $ = cheerio.load(html, { decodeEntities: false });
  const title = extractTitle($, humanizeSlug(base));
  const mainHtml = pageSlugs.has(base) ? extractStandalonePageHtml($) : extractMainHtml($);
  const excerpt = extractExcerpt($, mainHtml);
  const publishedAt = extractPublishedAt(cleanText($.text()));
  const bodyFragment = cheerio.load(`<div>${mainHtml}</div>`, { decodeEntities: false });
  const coverImage = bodyFragment("img").first().attr("src") ?? null;
  const { category, categoryLabel } = getCategoryInfo(filePath);
  const slug = base;

  return {
    slug,
    title,
    category,
    categoryLabel,
    sourcePath: relative,
    excerpt,
    contentHtml: mainHtml,
    coverImage,
    publishedAt,
    archivedAt: null,
    status: "published",
    legacyUrl: `/${relative}`,
    sortOrder: publishedAt ? new Date(publishedAt).getTime() * -1 : 0,
  };
}

async function main() {
  const files = await walk(root);
  const postsBySlug = new Map();
  const allPostRecords = [];
  const pages = [];

  for (const filePath of files) {
    const html = await fs.readFile(filePath, "utf8");
    const record = buildRecord(filePath, html);

    if (isLegacyPost(filePath)) {
      allPostRecords.push(record);
      const current = postsBySlug.get(record.slug);
      if (!current || prefersCanonicalRecord(record, current)) {
        postsBySlug.set(record.slug, record);
      }
      continue;
    }

    const base = path.basename(filePath, ".html");
    if (pageSlugs.has(base)) {
      pages.push({
        slug: base,
        title: record.title,
        sourcePath: record.sourcePath,
        contentHtml: record.contentHtml,
      });
    }
  }

  const posts = [...postsBySlug.values()];
  const aliases = new Map();

  for (const record of allPostRecords) {
    const canonical = postsBySlug.get(record.slug);
    const canonicalPath = canonicalPathForRecord(record, canonical);
    if (!canonicalPath) {
      continue;
    }

    const legacyUrl = `/${record.sourcePath}`;
    const variants = new Set([
      legacyUrl,
      legacyUrl.replace(/\/+$/, ""),
      legacyUrl.replace(/\.html$/, "/"),
      legacyUrl.replace(/\.html$/, ""),
      record.legacyUrl ?? "",
      (record.legacyUrl ?? "").replace(/\/+$/, ""),
      (record.legacyUrl ?? "").replace(/\.html$/, "/"),
      (record.legacyUrl ?? "").replace(/\.html$/, ""),
    ]);

    for (const variant of variants) {
      if (variant && variant !== canonicalPath) {
        aliases.set(variant, canonicalPath);
      }
    }
  }

  const normalizedPosts = posts.map((post) => ({
    ...post,
    contentHtml: rewriteLegacyLinks(post.contentHtml, post.sourcePath, aliases),
  }));

  normalizedPosts.sort((a, b) => {
    const aTime = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const bTime = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return bTime - aTime || a.title.localeCompare(b.title);
  });

  pages.sort((a, b) => a.title.localeCompare(b.title));

  const normalizedPages = pages.map((page) => ({
    ...page,
    contentHtml: rewriteLegacyLinks(page.contentHtml, page.sourcePath, aliases),
  }));

  await fs.writeFile(outPosts, `${JSON.stringify(normalizedPosts, null, 2)}\n`, "utf8");
  await fs.writeFile(outPages, `${JSON.stringify(normalizedPages, null, 2)}\n`, "utf8");
  await fs.writeFile(outAliases, `${JSON.stringify(Object.fromEntries(aliases), null, 2)}\n`, "utf8");

  console.log(`Imported ${normalizedPosts.length} posts and ${normalizedPages.length} standalone pages.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
