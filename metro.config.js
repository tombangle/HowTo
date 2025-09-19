// metro.config.js
const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

// Make sure these asset types are recognized (Windows sometimes needs this nudge)
config.resolver.assetExts = Array.from(
  new Set([
    ...config.resolver.assetExts,
    'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'
  ])
);

module.exports = config;