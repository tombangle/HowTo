// scripts/fix-public-path.js
// Rewrites absolute asset paths ("/...") to work on GitHub Pages project site "/HowTo/...".

const fs = require('fs');
const path = require('path');

const DIST = path.join(__dirname, '..', 'dist');

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

function rewriteFile(file) {
  let s = fs.readFileSync(file, 'utf8');

  // Core replacements:
  // 1) Any quoted absolute _expo URL → "/HowTo/_expo/..."
  s = s.replace(/(["'(])\/_expo\//g, '$1/HowTo/_expo/');

  // 2) Generic absolute refs in HTML attributes → add /HowTo prefix
  s = s.replace(/href="\//g, 'href="/HowTo/');
  s = s.replace(/src="\//g,  'src="/HowTo/');
  s = s.replace(/content="\//g, 'content="/HowTo/');

  // 3) CSS url(/_expo/...) → url(/HowTo/_expo/...)
  s = s.replace(/url\(\s*\/_expo\//g, 'url(/HowTo/_expo/');

  fs.writeFileSync(file, s);
  console.log('Rewrote:', path.relative(DIST, file));
}

if (!fs.existsSync(DIST)) {
  console.error('dist/ not found. Run `npx expo export --platform web` first.');
  process.exit(1);
}

const files = walk(DIST).filter(f =>
  /\.(html|json|js|css|map)$/i.test(f) // include manifest.json, chunks, css
);

files.forEach(rewriteFile);

console.log('✅ Public path rewrite complete.');