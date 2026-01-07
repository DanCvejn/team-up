import { EmptyState } from '@/components/common/EmptyState';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { CreateTeamModal } from '@/components/teams/CreateTeamModal';
import { JoinTeamModal } from '@/components/teams/JoinTeamModal';
import { TeamCard } from '@/components/teams/TeamCard';
import { TeamsFAB } from '@/components/teams/TeamsFAB';
import { useTeams } from '@/hooks';
import useAlert from '@/hooks/useAlert';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

export default function TeamsListScreen() {
  const { teams, isLoading, createTeam, joinTeam, fetchTeams } = useTeams();
  const router = useRouter();
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchTeams().catch(err => {
        // Tiše ignoruj chyby při focus refresh
        console.warn('Error refreshing teams on focus:', err);
      });
    }, [fetchTeams])
  );
  const { success } = useAlert();

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchTeams();
    setIsRefreshing(false);
  };

  const handleJoin = async (code: string) => {
    await joinTeam(code);
    success('Úspěch', 'Připojil jsi se k týmu!');
  };

  const handleCreate = async (data: { name: string; description?: string }) => {
    await createTeam(data);
    success('Úspěch', 'Tým byl vytvořen!');
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={teams}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <TeamCard
            team={item}
            onPress={() => router.push(`/(tabs)/teams/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="👥"
            title="Zatím žádné týmy"
            subtitle="Vytvoř nový tým nebo se připoj k existujícímu"
          />
        }
      />

      <TeamsFAB
        onCreatePress={() => setShowCreateModal(true)}
        onJoinPress={() => setShowJoinModal(true)}
      />

      <JoinTeamModal
        visible={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onJoin={handleJoin}
      />

      <CreateTeamModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  list: {
    padding: 20,
    paddingBottom: 100,
  },
});