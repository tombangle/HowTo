// writes index.html + 404.html and .nojekyll based on the emitted entry-*.js
const fs = require('fs');
const path = require('path');

const webDir = path.join('dist', '_expo', 'static', 'js', 'web');
if (!fs.existsSync(webDir)) {
  console.error('No web bundle found at', webDir);
  process.exit(1);
}
const entry = fs.readdirSync(webDir).find(f => /^entry-.*\.js$/.test(f));
if (!entry) {
  console.error('No entry-*.js found in', webDir);
  process.exit(1);
}

const html = `<!DOCTYPE html><html lang="en"><head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"/>
<title>Decision Tree App</title><meta name="theme-color" content="#ffffff"/>
<script type="module">globalThis.__EXPO_ROUTER_HYDRATE__=false;</script>
</head><body><div id="root"></div>
<!-- Use RELATIVE path so it works when served from /HowTo/ -->
<script src="./_expo/static/js/web/${entry}" defer></script>
</body></html>`;

fs.writeFileSync(path.join('dist', 'index.html'), html);
fs.writeFileSync(path.join('dist', '404.html'), html);
fs.writeFileSync(path.join('dist', '.nojekyll'), '');
console.log('Wrote index.html, 404.html, .nojekyll');