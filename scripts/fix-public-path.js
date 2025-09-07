// scripts/fix-public-path.js
// Rewrites absolute asset paths ("/...") to work on GitHub Pages project site "/HowTo/...".

const fs = require('fs');
const path = require('path');
const DIST = path.join(__dirname, '..', 'dist');

function walk(d){ return fs.readdirSync(d).flatMap(e=>{
  const p = path.join(d,e); const s = fs.statSync(p);
  return s.isDirectory()? walk(p) : [p];
});}

function rewriteOnce(s){
  // Prefix absolute /_expo/... with /HowTo/ if not already
  s = s.replace(/(["'(])\/(?!HowTo\/)_expo\//g, '$1/HowTo/_expo/');

  // HTML attrs: href/src/content → add /HowTo if path is absolute and not already prefixed
  s = s.replace(/\bhref="\/(?!HowTo\/)/g, 'href="/HowTo/');
  s = s.replace(/\bsrc="\/(?!HowTo\/)/g,  'src="/HowTo/');
  s = s.replace(/\bcontent="\/(?!HowTo\/)/g, 'content="/HowTo/');

  // CSS url(/_expo/...) → prefix
  s = s.replace(/url\(\s*\/(?!HowTo\/)_expo\//g, 'url(/HowTo/_expo/');

  // modulepreload hrefs
  s = s.replace(/\brel="modulepreload"\s+href="\/(?!HowTo\/)/g, 'rel="modulepreload" href="/HowTo/');

  // Safety: collapse accidental doubles
  s = s.replace(/\/HowTo\/HowTo\//g, '/HowTo/');
  return s;
}

if (!fs.existsSync(DIST)) { console.error('dist/ missing'); process.exit(1); }

walk(DIST)
  .filter(f => /\.(html|js|css|json|map)$/i.test(f))
  .forEach(f => {
    const o = fs.readFileSync(f, 'utf8');
    const n = rewriteOnce(o);
    if (n !== o) {
      fs.writeFileSync(f, n);
      console.log('Rewrote:', path.relative(DIST, f));
    }
  });

console.log('✅ Public path rewrite complete.');