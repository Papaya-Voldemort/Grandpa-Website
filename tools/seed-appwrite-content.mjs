import fs from "node:fs/promises";
import { Client, TablesDB } from "node-appwrite";

const endpoint =
  process.env.APPWRITE_URL ||
  process.env.APPWRITE_ENDPOINT ||
  process.env.APPWRITE_SITE_API_ENDPOINT ||
  process.env.PUBLIC_APPWRITE_ENDPOINT ||
  "";
const projectId =
  process.env.APPWRITE_PROJECT_ID ||
  process.env.APPWRITE_SITE_PROJECT_ID ||
  process.env.PUBLIC_APPWRITE_PROJECT_ID ||
  "";
const apiKey = process.env.APPWRITE_KEY || process.env.APPWRITE_API_KEY || "";
const databaseId = process.env.APPWRITE_DATABASE_ID || "grandpa_site";
const tableId = process.env.APPWRITE_POSTS_TABLE_ID || "posts";

if (!endpoint || !projectId || !apiKey || !databaseId || !tableId) {
  console.error("Missing Appwrite env vars. Set APPWRITE_URL, APPWRITE_PROJECT_ID, and APPWRITE_KEY.");
  process.exit(1);
}

const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
const databases = new TablesDB(client);

function slugify(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function hashValue(value) {
  let hash = 5381;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 33) ^ value.charCodeAt(index);
  }
  return (hash >>> 0).toString(36);
}

function rowIdFromValue(value) {
  const slug = slugify(value) || "post";
  if (slug.length <= 36) {
    return slug;
  }

  const hash = hashValue(value).slice(0, 8);
  const prefix = slug.slice(0, 27).replace(/[-_.]+$/g, "") || "post";
  return `${prefix}-${hash}`;
}

async function main() {
  const legacyPosts = JSON.parse(
    await fs.readFile(new URL("../src/data/legacy-content.json", import.meta.url), "utf8"),
  );

  for (const post of legacyPosts) {
    const payload = {
      slug: post.slug,
      title: post.title,
      category: post.category,
      categoryLabel: post.categoryLabel,
      excerpt: post.excerpt,
      contentHtml: post.contentHtml,
      coverImage: post.coverImage ?? null,
      status: post.status ?? "published",
      publishedAt: post.publishedAt ?? null,
      archivedAt: post.archivedAt ?? null,
      legacySourcePath: post.sourcePath,
      legacyUrl: post.legacyUrl ?? null,
      sortOrder: post.sortOrder ?? 0,
    };

    try {
      await databases.upsertRow({
        databaseId,
        tableId,
        rowId: rowIdFromValue(post.slug),
        data: payload,
      });
      console.log(`Seeded ${post.slug}`);
    } catch (error) {
      console.error(`Failed to seed ${post.slug}`);
      console.error(error);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
