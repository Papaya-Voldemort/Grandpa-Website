import fs from "node:fs/promises";
import path from "node:path";

const root = path.resolve(process.cwd(), "public_html");

const menuIncludePattern = /[ \t]*<\?php\s+include\s+['"]http:\/\/stephenmbird\.com\/scripts\/menu\.php['"];\s*\?>[ \t]*/gi;
const siteSearchIncludePattern = /[ \t]*<\?php\s+include\s+['"]http:\/\/stephenmbird\.com\/scripts\/sitesearch\.php['"];\s*\?>[ \t]*/gi;
const quoteIncludePattern = /[ \t]*<\?php\s+include\s+['"]http:\/\/stephenmbird\.com\/scripts\/quote\.php['"];\s*\?>[ \t]*/gi;
const trackingIncludePattern = /[ \t]*<\?php\s+(?:\/\/\s*)?include\s+['"][^'"]*scripts\/tracking\/popular\.php['"];\s*\?>[ \t]*\n?/gi;
const trackingSimpleIncludePattern = /[ \t]*<\?php\s+include\s+['"][^'"]*scripts\/tracking\/simple\.php['"];\s*\?>[ \t]*\n?/gi;
const commentedQuoteIncludePattern = /[ \t]*<\?php\s*\/\/\s*include\s+['"][^'"]*scripts\/quote\.php['"];\s*\?>[ \t]*\n?/gi;
const analyticsPattern = /[ \t]*<!--\s*Google Analytics(?: Script)?\s*-->[\s\S]*?<\/script>\s*(?:<!--\s*end Google Analytics Script\s*-->|<!--\s*Google Analytics Script\s*-->)?\s*/gi;
const legacyAnalyticsPattern = /[ \t]*<script type="text\/javascript">\s*var _gaq = _gaq \|\| \[\];[\s\S]*?<\/script>\s*/gi;

const skipDirs = new Set([
  path.join(root, "scripts", "googleAnalytics"),
  path.join(root, "scripts", "tracking"),
]);

const deletePaths = [
  path.join(root, "scripts", "googleAnalytics"),
  path.join(root, "scripts", "tracking"),
  path.join(root, "scripts", "email.php"),
  path.join(root, "scripts", "email.html"),
  path.join(root, "scripts", "menu.php"),
  path.join(root, "scripts", "quote.php"),
  path.join(root, "scripts", "sitesearch.php"),
  path.join(root, "php.ini"),
];

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (skipDirs.has(fullPath)) {
      continue;
    }
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
      continue;
    }
    files.push(fullPath);
  }

  return files;
}

function replacePhpLinks(content) {
  return content.replace(
    /((?:href|src|action)\s*=\s*["'])(?![a-z]+:\/\/|\/\/)([^"'?#]+)\.php((?:[?#][^"']*)?["'])/gi,
    "$1$2.html$3",
  );
}

function ensureHeadUpgrades(content) {
  let next = content.replace(/<!DOCTYPE\s+HTML>/gi, "<!DOCTYPE html>");
  next = next.replace(
    /<meta\s+http-equiv=["']Content-Type["']\s+content=["']text\/html;\s*charset=(?:UTF-8|utf-8|utf-8|utf-8)["']\s*\/?>/gi,
    '<meta charset="utf-8">',
  );

  if (!/<meta\s+charset=/i.test(next)) {
    next = next.replace(/<head>/i, "<head>\n<meta charset=\"utf-8\">");
  }

  if (!/<meta[^>]+name=["']viewport["']/i.test(next)) {
    next = next.replace(
      /<meta charset="utf-8">\s*/i,
      '<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n',
    );
  }

  if (!/\/scripts\/site\.js/i.test(next)) {
    next = next.replace(/<\/head>/i, '  <script src="/scripts/site.js" defer></script>\n</head>');
  }

  return next;
}

function upgradeContent(filePath, content) {
  let next = content;

  next = next.replace(menuIncludePattern, '<div data-include="/partials/menu.html"></div>');
  next = next.replace(siteSearchIncludePattern, '<div data-include="/partials/sitesearch.html"></div>');
  next = next.replace(quoteIncludePattern, '<div data-include="/partials/quote.html"></div>');
  next = next.replace(trackingIncludePattern, "");
  next = next.replace(trackingSimpleIncludePattern, "");
  next = next.replace(commentedQuoteIncludePattern, "");
  next = next.replace(analyticsPattern, "");
  next = next.replace(legacyAnalyticsPattern, "");
  next = replacePhpLinks(next);
  next = next.replace(/http:\/\/www\.google\.com\/afsonline\/show_afs_search\.js/gi, "https://cse.google.com/cse.js");

  if (path.basename(filePath) === "search.php") {
    next = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Search | Stephen M. Bird</title>
  <link href="/scripts/stephenmbird.css" rel="stylesheet" type="text/css">
  <script src="/scripts/site.js" defer></script>
</head>
<body>
<div class="container">
  <div class="header">
    <a href="/index.html">
      <img src="/images/header.jpg" width="960" height="147" alt="Stephen M. Bird header">
    </a>
    <div data-include="/partials/menu.html"></div>
  </div>
  <div class="content" style="padding: 2rem 1.5rem 3rem;">
    <h1 class="brown">Search This Site</h1>
    <div data-include="/partials/sitesearch.html"></div>
  </div>
  <div class="footer">
    <h5>Copyright &copy; 2011 Stephen M. Bird. All rights reserved.</h5>
  </div>
</div>
</body>
</html>
`;
  }

  if (path.basename(filePath) === "contact.php") {
    next = next.replace(
      /<iframe[\s\S]*?<\/iframe>/i,
      `<div class="contact-panel">
    <p>This static site no longer uses a server-side contact form.</p>
    <p>You can email Stephen directly at <a href="mailto:writersteve49@gmail.com">writersteve49@gmail.com</a>.</p>
    <p><a class="contact-email-button" href="mailto:writersteve49@gmail.com?subject=Message%20from%20StephenMBird.com">Open Email App</a></p>
  </div>`,
    );
  }

  if (path.basename(filePath) === "email-form.php") {
    next = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contact Stephen M. Bird</title>
  <link href="/scripts/stephenmbird.css" rel="stylesheet" type="text/css">
  <script src="/scripts/site.js" defer></script>
</head>
<body>
  <div class="contact-panel">
    <h1 class="brown">Send Me an Email</h1>
    <p>This site is now fully static, so messages are sent through your email app instead of a server-side form.</p>
    <p><a class="contact-email-button" href="mailto:writersteve49@gmail.com?subject=Message%20from%20StephenMBird.com">Email writersteve49@gmail.com</a></p>
  </div>
</body>
</html>
`;
  }

  if (filePath === path.join(root, "prayersthatbringmiracles", "index.php")) {
    next = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Redirecting...</title>
  <meta http-equiv="refresh" content="0; url=/prayers-that-bring-miracles.html">
  <link rel="canonical" href="/prayers-that-bring-miracles.html">
</head>
<body>
  <p>Redirecting to <a href="/prayers-that-bring-miracles.html">Prayers That Bring Miracles</a>...</p>
</body>
</html>
`;
  }

  if (filePath === path.join(root, "500.php")) {
    next = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>500 Server Error</title>
</head>
<body>
  <h1>500 Server Error</h1>
  <p>A temporary problem prevented this page from loading.</p>
  <p>Please try again in a moment.</p>
</body>
</html>
`;
  }

  next = ensureHeadUpgrades(next);
  next = next.replace(/<html(?![^>]*lang=)/i, '<html lang="en"');
  next = next.replace(/<img([^>]*?)(?<!\/)(?<!\s\/)>/gi, "<img$1>");

  return next;
}

async function main() {
  const files = await walk(root);
  const phpFiles = files.filter((file) => file.endsWith(".php"));

  for (const file of phpFiles) {
    const source = await fs.readFile(file, "utf8");
    const upgraded = upgradeContent(file, source);
    const htmlPath = file.slice(0, -4) + ".html";
    await fs.writeFile(htmlPath, upgraded, "utf8");
    await fs.unlink(file);
  }

  const refreshFiles = (await walk(root)).filter((file) =>
    /\.(html|css|js|shtml|txt|xml)$/i.test(file),
  );

  for (const file of refreshFiles) {
    let source = await fs.readFile(file, "utf8");
    source = replacePhpLinks(source);
    source = source.replace(/\/contact\.php/gi, "/contact.html");
    source = source.replace(/\/about-me\.php/gi, "/about-me.html");
    source = source.replace(/\/about-this-website\.php/gi, "/about-this-website.html");
    source = source.replace(/\/prayers-that-bring-miracles\.php/gi, "/prayers-that-bring-miracles.html");
    source = source.replace(/\/library\/archives\/index\.html/gi, "/library/archives/");
    await fs.writeFile(file, source, "utf8");
  }

  for (const target of deletePaths) {
    await fs.rm(target, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
