import { useAuth } from '@/hooks';
import { Redirect } from 'expo-router';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/events" />;
  }

  return <Redirect href="/(auth)/login" />;
}