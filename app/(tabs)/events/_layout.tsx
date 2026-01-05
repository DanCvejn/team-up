import { Stack } from 'expo-router';

export default function EventsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen
        name="index"
        options={{ title: 'Všechny akce' }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Detail akce',
          presentation: 'card',
        }}
      />
    </Stack>
  );
}