const { getDefaultConfig } = require('@expo/metro-config');
const config = getDefaultConfig(__dirname);

config.resolver.assetExts = Array.from(
  new Set([...config.resolver.assetExts, 'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'])
);

module.exports = config;