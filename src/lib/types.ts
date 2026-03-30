export type PostStatus = "draft" | "published" | "archived";

export type LegacyPost = {
  slug: string;
  title: string;
  category: string;
  categoryLabel: string;
  sourcePath: string;
  excerpt: string;
  contentHtml: string;
  coverImage?: string | null;
  publishedAt?: string | null;
  archivedAt?: string | null;
  status?: PostStatus;
  legacyUrl?: string;
  sortOrder?: number;
};

export type SitePage = {
  slug: string;
  title: string;
  sourcePath: string;
  contentHtml: string;
};

export type PostRecord = {
  $id?: string;
  slug: string;
  title: string;
  category: string;
  categoryLabel: string;
  excerpt: string;
  contentHtml: string;
  coverImage?: string | null;
  status: PostStatus;
  publishedAt?: string | null;
  archivedAt?: string | null;
  legacySourcePath?: string | null;
  legacyUrl?: string | null;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type AdminSession = {
  userId: string;
  email?: string | null;
  name?: string | null;
};
