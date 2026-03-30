import fs from "node:fs/promises";
import path from "node:path";
import * as cheerio from "cheerio";

const root = path.resolve(process.cwd(), "public_html");
const outPosts = path.resolve(process.cwd(), "src/data/legacy-content.json");
const outPages = path.resolve(process.cwd(), "src/data/legacy-pages.json");

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
  const mainHtml = extractMainHtml($);
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
  const posts = [];
  const pages = [];

  for (const filePath of files) {
    const html = await fs.readFile(filePath, "utf8");
  const record = buildRecord(filePath, html);

  if (isLegacyPost(filePath)) {
    posts.push(record);
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

  posts.sort((a, b) => {
    const aTime = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const bTime = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return bTime - aTime || a.title.localeCompare(b.title);
  });

  pages.sort((a, b) => a.title.localeCompare(b.title));

  await fs.writeFile(outPosts, `${JSON.stringify(posts, null, 2)}\n`, "utf8");
  await fs.writeFile(outPages, `${JSON.stringify(pages, null, 2)}\n`, "utf8");

  console.log(`Imported ${posts.length} posts and ${pages.length} standalone pages.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
