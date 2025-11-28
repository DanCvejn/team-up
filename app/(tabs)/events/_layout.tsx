import { Stack } from 'expo-router';

export default function EventsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: 'Všechny akce' }}
      />
      <Stack.Screen
        name="[id]"
        options={{ title: 'Detail akce' }}
      />
    </Stack>
  );
}