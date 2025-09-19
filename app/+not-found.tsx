// app/+not-found.tsx
import { Stack } from 'expo-router';
import { View, Text } from 'react-native';

export default function NotFound() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not found' }} />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 18 }}>404 — Page not found</Text>
      </View>
    </>
  );
}