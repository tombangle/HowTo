// Fix GitHub Pages subpath by making _expo asset paths relative.
// Works whether Expo emits entry-*.js or AppEntry-*.js and whether
// docs/index.html exists or not.

const fs = require('fs');
const path = require('path');

const OUT = 'docs';
const WEB_DIR = path.join(OUT, '_expo', 'static', 'js', 'web');
const INDEX = path.join(OUT, 'index.html');
const FOUR_OH_FOUR = path.join(OUT, '404.html');

function ensureNoJekyll() {
  try {
    fs.writeFileSync(path.join(OUT, '.nojekyll'), '');
  } catch (e) {}
}

function findMainJS() {
  if (!fs.existsSync(WEB_DIR)) {
    throw new Error(`No web bundle found at ${WEB_DIR}. Did you run the export?`);
  }
  const files = fs.readdirSync(WEB_DIR);
  // Look for either entry-*.js or AppEntry-*.js
  const main =
    files.find(f => /^entry-.*\.js$/.test(f)) ||
    files.find(f => /^AppEntry-.*\.js$/.test(f));
  if (!main) {
    throw new Error(`No entry-*.js or AppEntry-*.js found in ${WEB_DIR}`);
  }
  return main;
}

function createMinimalIndex(mainJsFile) {
  const html = `<!DOCTYPE html><html lang="en"><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"/>
<title>Decision Tree App</title>
<meta name="theme-color" content="#ffffff"/>
<script type="module">globalThis.__EXPO_ROUTER_HYDRATE__=false;</script>
</head><body><div id="root"></div>
<!-- IMPORTANT: relative path so it works under /HowTo/ -->
<script src="./_expo/static/js/web/${mainJsFile}" defer></script>
</body></html>`;
  fs.writeFileSync(INDEX, html);
  fs.writeFileSync(FOUR_OH_FOUR, html);
}

function patchExistingIndex() {
  let html = fs.readFileSync(INDEX, 'utf8');
  // Replace absolute /_expo/... with relative ./_expo/...
  html = html.replace(/(src|href)=\"\/_expo\//g, '$1="./_expo/');
  fs.writeFileSync(INDEX, html);
  fs.writeFileSync(FOUR_OH_FOUR, html);
}

(function run() {
  ensureNoJekyll();
  if (fs.existsSync(INDEX)) {
    patchExistingIndex();
    console.log('✅ Patched docs/index.html (/_expo → ./_expo) and wrote docs/404.html');
  } else {
    const mainJs = findMainJS();
    createMinimalIndex(mainJs);
    console.log(`✅ Created docs/index.html & docs/404.html -> ./_expo/.../${mainJs}`);
  }
})();