import { Client, Permission, Role, Storage, TablesDB } from "node-appwrite";

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
const bucketId = process.env.APPWRITE_MEDIA_BUCKET_ID || "media";

if (!endpoint || !projectId || !apiKey || !databaseId || !tableId) {
  console.error("Missing Appwrite env vars. Set APPWRITE_URL, APPWRITE_PROJECT_ID, and APPWRITE_KEY.");
  process.exit(1);
}

const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
const tables = new TablesDB(client);
const storage = new Storage(client);

const columnDefinitions = [
  {
    key: "slug",
    ensure: () => tables.createStringColumn({ databaseId, tableId, key: "slug", size: 128, required: true }),
  },
  {
    key: "title",
    ensure: () => tables.createStringColumn({ databaseId, tableId, key: "title", size: 255, required: true }),
  },
  {
    key: "category",
    ensure: () => tables.createStringColumn({ databaseId, tableId, key: "category", size: 128, required: true }),
  },
  {
    key: "categoryLabel",
    ensure: () => tables.createStringColumn({ databaseId, tableId, key: "categoryLabel", size: 255, required: true }),
  },
  {
    key: "excerpt",
    ensure: () => tables.createTextColumn({ databaseId, tableId, key: "excerpt", required: false }),
  },
  {
    key: "contentHtml",
    ensure: () => tables.createTextColumn({ databaseId, tableId, key: "contentHtml", required: false }),
  },
  {
    key: "coverImage",
    ensure: () => tables.createStringColumn({ databaseId, tableId, key: "coverImage", size: 1024, required: false }),
  },
  {
    key: "status",
    ensure: () =>
      tables.createStringColumn({
        databaseId,
        tableId,
        key: "status",
        size: 32,
        required: true,
      }),
  },
  {
    key: "publishedAt",
    ensure: () => tables.createDatetimeColumn({ databaseId, tableId, key: "publishedAt", required: false }),
  },
  {
    key: "archivedAt",
    ensure: () => tables.createDatetimeColumn({ databaseId, tableId, key: "archivedAt", required: false }),
  },
  {
    key: "legacySourcePath",
    ensure: () => tables.createStringColumn({ databaseId, tableId, key: "legacySourcePath", size: 255, required: false }),
  },
  {
    key: "legacyUrl",
    ensure: () => tables.createStringColumn({ databaseId, tableId, key: "legacyUrl", size: 1024, required: false }),
  },
  {
    key: "sortOrder",
    ensure: () => tables.createIntegerColumn({ databaseId, tableId, key: "sortOrder", required: false, xdefault: 0 }),
  },
];

async function ensureDatabase() {
  try {
    await tables.get({ databaseId });
    console.log(`Database ${databaseId} already exists.`);
  } catch {
    await tables.create({ databaseId, name: "GrandpaSite", enabled: true });
    console.log(`Created database ${databaseId}.`);
  }
}

async function ensureTable() {
  try {
    await tables.getTable({ databaseId, tableId });
    console.log(`Table ${tableId} already exists.`);
  } catch {
    await tables.createTable({
      databaseId,
      tableId,
      name: "Posts",
      rowSecurity: false,
      enabled: true,
    });
    console.log(`Created table ${tableId}.`);
  }
}

async function ensureColumns() {
  const existing = await tables.listColumns({ databaseId, tableId });
  const columns = existing.columns ?? existing.rows ?? existing.attributes ?? [];
  const existingKeys = new Set(columns.map((column) => column.key));

  for (const definition of columnDefinitions) {
    if (existingKeys.has(definition.key)) {
      continue;
    }

    await definition.ensure();
    console.log(`Created column ${definition.key}.`);
  }
}

async function ensureSlugIndex() {
  try {
    await tables.getIndex({ databaseId, tableId, key: "slug_unique" });
  } catch {
    await tables.createIndex({
      databaseId,
      tableId,
      key: "slug_unique",
      type: "unique",
      columns: ["slug"],
    });
    console.log("Created unique index slug_unique.");
  }
}

async function ensureBucket() {
  if (!bucketId) {
    console.log("No APPWRITE_MEDIA_BUCKET_ID provided, skipping bucket setup.");
    return;
  }

  try {
    await storage.getBucket({ bucketId });
    console.log(`Bucket ${bucketId} already exists.`);
  } catch {
    await storage.createBucket({
      bucketId,
      name: "GrandpaSite Media",
      permissions: [Permission.read(Role.any())],
      fileSecurity: false,
      enabled: true,
      maximumFileSize: 25 * 1024 * 1024,
      allowedFileExtensions: ["png", "jpg", "jpeg", "gif", "webp", "svg", "pdf"],
      transformations: true,
    });
    console.log(`Created bucket ${bucketId}.`);
  }
}

async function main() {
  await ensureDatabase();
  await ensureTable();
  await ensureColumns();
  await ensureSlugIndex();
  await ensureBucket();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
