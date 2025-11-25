import { Stack } from 'expo-router';

export default function TeamsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: 'Moje týmy' }}
      />
      <Stack.Screen
        name="[id]"
        options={{ title: 'Detail týmu' }}
      />
      <Stack.Screen
        name="create"
        options={{
          title: 'Nový tým',
          presentation: 'modal'
        }}
      />
    </Stack>
  );
}