# GrandpaSite

Astro + Appwrite rebuild of the Stephen M. Bird site.

## What this adds

- Appwrite Sites SSR hosting
- Appwrite-backed post storage
- Protected admin login
- Rich text post editor
- Legacy HTML migration support
- Clean slug routes with redirects for old `.html` links

## Setup

1. Copy `.env.example` to your local environment and fill in your Appwrite values.
2. Run `npm install`.
3. Run `npm run appwrite:provision` to create the database table, columns, index, and media bucket.
4. Run `npm run seed:appwrite` to import the legacy posts into Appwrite.
5. Run `npm run dev` to start the site locally.

## Appwrite values

- `APPWRITE_URL` and `APPWRITE_PROJECT_ID` are the preferred runtime names.
- `APPWRITE_KEY` must stay server-side.
- The older `APPWRITE_SITE_API_ENDPOINT`, `APPWRITE_SITE_PROJECT_ID`, and `APPWRITE_API_KEY` names still work as fallbacks.
- `APPWRITE_DATABASE_ID`, `APPWRITE_POSTS_TABLE_ID`, and `APPWRITE_MEDIA_BUCKET_ID` point to the content store.
- If you do not set those IDs, the app will use `grandpa_site`, `posts`, and `media` by default.
- `APPWRITE_ADMIN_EMAILS` should list the approved writer account(s).

## Content workflow

- Public pages render from Appwrite when configured.
- Legacy HTML remains in `public_html/` as the local migration source, while the generated JSON under `src/data/` is what the app uses at build time.
- The admin editor can create, edit, archive, and delete posts without touching HTML files.
- The editor includes a live preview, raw HTML mode for legacy edge cases, and image upload into Appwrite Storage.
