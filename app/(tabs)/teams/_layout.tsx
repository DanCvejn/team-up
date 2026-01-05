import { Stack } from 'expo-router';

export default function TeamsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen
        name="index"
        options={{ title: 'Moje týmy' }}
      />
      <Stack.Screen
        name="[id]"
        options={{ title: 'Detail týmu' }}
      />
    </Stack>
  );
}