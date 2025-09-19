// app/_sitemap.tsx
// Override Expo Router’s internal sitemap page that imports a PNG.
// Returning a minimal component avoids pulling that asset at build time.
import { Stack } from 'expo-router';
import { View, Text } from 'react-native';

export default function Sitemap() {
  return (
    <>
      <Stack.Screen options={{ title: 'Sitemap' }} />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text>Sitemap</Text>
      </View>
    </>
  );
}