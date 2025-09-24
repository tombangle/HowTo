// scripts/patch-index.js
// Writes docs/index.html + docs/404.html and .nojekyll using the emitted entry-*.js
const fs = require('fs');
const path = require('path');

const OUT = 'docs'; // GitHub Pages serves from /docs
const webDir = path.join(OUT, '_expo', 'static', 'js', 'web');

if (!fs.existsSync(webDir)) {
  console.error('No web bundle found at', webDir, '\nDid you run: npm run build:web ?');
  process.exit(1);
}

const entry = fs.readdirSync(webDir).find(f => /^entry-.*\.js$/.test(f));
if (!entry) {
  console.error('No entry-*.js found in', webDir);
  process.exit(1);
}

// Use a RELATIVE path so it works under /HowTo/
const html = `<!DOCTYPE html><html lang="en"><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"/>
<title>Decision Tree App</title>
<meta name="theme-color" content="#ffffff"/>
<script type="module">globalThis.__EXPO_ROUTER_HYDRATE__=false;</script>
</head><body><div id="root"></div>
<script src="./_expo/static/js/web/${entry}" defer></script>
</body></html>`;

fs.writeFileSync(path.join(OUT, 'index.html'), html);
fs.writeFileSync(path.join(OUT, '404.html'), html);
fs.writeFileSync(path.join(OUT, '.nojekyll'), '');
console.log('✅ Wrote docs/index.html, docs/404.html, docs/.nojekyll (relative _expo path)');