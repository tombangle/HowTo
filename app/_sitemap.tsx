import { View, Text } from 'react-native';

// Minimal page override so Expo Router doesn't use its internal Sitemap page (which imports a PNG)
export default function SitemapPage() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Sitemap</Text>
    </View>
  );
}