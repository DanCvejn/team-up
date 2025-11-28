import { useAuth } from '@/hooks';
import { Redirect } from 'expo-router';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null; // Or your loading screen
  }

  console.log('isAuthenticated', isAuthenticated);
  if (isAuthenticated) {
    return <Redirect href="/(tabs)/teams" />;
  }

  return <Redirect href="/(auth)/login" />;
}