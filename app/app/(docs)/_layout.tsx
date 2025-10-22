import { Stack } from "expo-router";

export default function DocsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="reader" />
    </Stack>
  );
}
