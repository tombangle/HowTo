#!/usr/bin/env bash
set -euo pipefail

APP_SUBPATH="/HowTo"      # your GitHub Pages subpath
OUT_DIR="dist"
DOCS_DIR="docs"

echo "== Clean =="
rm -rf "$OUT_DIR" "$DOCS_DIR" .expo .cache node_modules/.cache

echo "== Export web build to $OUT_DIR =="
npx expo export --platform web --output-dir "$OUT_DIR"

echo "== Ensure index.html exists =="
if [ ! -f "$OUT_DIR/index.html" ]; then
  ENTRY_FILE=$(basename "$OUT_DIR"/_expo/static/js/web/entry-*.js 2>/dev/null || true)
  if [ -z "${ENTRY_FILE:-}" ]; then
    echo "❌ No entry bundle found in $OUT_DIR/_expo/static/js/web/. Export likely failed."
    echo "   Check the export logs above, then re-run this script."
    exit 1
  fi
  cat > "$OUT_DIR/index.html" <<EOF
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <title>Decision Tree App</title>
    <meta name="theme-color" content="#ffffff" />
    <script type="module">globalThis.__EXPO_ROUTER_HYDRATE__=true;</script>
  </head>
  <body>
    <div id="root"></div>
    <script src="/_expo/static/js/web/${ENTRY_FILE}" defer></script>
  </body>
</html>
EOF
fi

echo "== SPA fallback + disable Jekyll =="
cp "$OUT_DIR/index.html" "$OUT_DIR/404.html"
touch "$OUT_DIR/.nojekyll"

echo "== Prefix absolute URLs for GitHub Pages subpath ($APP_SUBPATH) =="
# update src/href/content absolute paths and _expo references
sed -i \
  -e "s|href=\"/|href=\"${APP_SUBPATH}/|g" \
  -e "s|src=\"/|src=\"${APP_SUBPATH}/|g" \
  -e "s|content=\"/|content=\"${APP_SUBPATH}/|g" \
  -e "s|(/_expo/|(${APP_SUBPATH}/_expo/|g" \
  "$OUT_DIR/index.html" "$OUT_DIR/404.html"

echo "== Publish to /$DOCS_DIR =="
mkdir -p "$DOCS_DIR"
cp -R "$OUT_DIR"/. "$DOCS_DIR"/

echo "== Sanity check =="
ls -la "$DOCS_DIR" | sed -n '1,80p'
ls -la "$DOCS_DIR/_expo/static/js/web" | sed -n '1,40p'
grep -n 'script src=' "$DOCS_DIR/index.html"

echo "== Commit & push =="
git add "$DOCS_DIR"
git commit -m "Deploy web build to /docs (auto-generated index.html, .nojekyll, ${APP_SUBPATH} prefix)" || true
git push

echo "✅ Done. Ensure GitHub Pages is set to: Source=main, Folder=/docs"