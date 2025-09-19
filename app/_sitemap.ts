// app/_sitemap.ts
// Minimal override so expo-router won't import its internal sitemap PNG.
export default function sitemap() {
  // Return the routes you want indexed.
  // Minimal is just the root.
  return [
    { route: '/' },
    // Add more routes here if you want them in the sitemap:
    // { route: '/foo' },
  ] as const;
}