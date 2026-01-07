import Modal from '@/components/common/Modal';
import { CreateEventModal } from '@/components/events/CreateEventModal';
import { MemberActionsSheet } from '@/components/teams/MemberActionsSheet';
import { TeamDetailHeader } from '@/components/teams/TeamDetailHeader';
import { TeamEventsList } from '@/components/teams/TeamEventsList';
import { TeamMembersList } from '@/components/teams/TeamMembersList';
import { TeamSettingsSheet } from '@/components/teams/TeamSettingsSheet';
import { useAlert, useAuth, useEvents, useTeam, useTeams } from '@/hooks';
import type { TeamMember } from '@/lib/types';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function TeamDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  // Ensure id is a string, not an array
  const teamId = Array.isArray(id) ? id[0] : id;
  const { team, members, isLoading, removeMember, updateMemberRole } = useTeam(teamId);
  const { deleteTeam } = useTeams();
  const { events, createEvent } = useEvents(teamId);

  const [showSettings, setShowSettings] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showAllEvents, setShowAllEvents] = useState(false);

  const { success, error: showError } = useAlert();

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!team) {
    return null;
  }

  const currentMember = members.find(m => m.user === user?.id);
  const isAdmin = currentMember?.role === 'admin';
  const isCreator = team.created_by === user?.id;

  // (hook already declared above)

  const handleLeaveTeam = async () => {
    try {
      // TODO: Implement leave team (leave team)
      success('Úspěch', 'Opustil jsi tým');
      router.dismiss();
    } catch (error: any) {
      showError('Chyba', error.message);
    }
  };

  const handleDeleteTeam = async () => {
    try {
      await deleteTeam(teamId);
      success('Úspěch', 'Tým byl smazán');
      router.dismiss();
    } catch (error: any) {
      showError('Chyba', error.message);
    }
  };

  const handleChangeRole = async (memberId: string, newRole: 'admin' | 'member') => {
    try {
      await updateMemberRole(memberId, newRole);
      success('Úspěch', 'Role byla změněna');
    } catch (error: any) {
      showError('Chyba', error.message);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      await removeMember(memberId);
      success('Úspěch', 'Člen byl odebrán');
    } catch (error: any) {
      showError('Chyba', error.message);
    }
  };

  return (
    <>
      <ScrollView style={styles.container}>
        <TeamDetailHeader
          team={team}
          memberCount={members.length}
          isAdmin={isAdmin}
          onSettingsPress={() => setShowSettings(true)}
          onShowAllEvents={() => setShowAllEvents(true)}
        />

        <TeamEventsList
          events={events}
          onEventPress={(eventId) => {
            router.push(`/(tabs)/events/${eventId}`);
          }}
          onCreatePress={() => setShowCreateEvent(true)}
          onShowAllPress={() => setShowAllEvents(true)}
        />

        <TeamMembersList
          members={members}
          currentUserId={user?.id || ''}
          canManageMembers={isAdmin}
          onMemberPress={setSelectedMember}
        />
      </ScrollView>

      <TeamSettingsSheet
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        team={team}
        isCreator={isCreator}
        onEditTeam={() => {
          // TODO: Navigate to edit team
        }}
        onLeaveTeam={handleLeaveTeam}
        onDeleteTeam={handleDeleteTeam}
      />

      <CreateEventModal
        visible={showCreateEvent}
        onClose={() => setShowCreateEvent(false)}
        onCreate={async (data) => {
          try {
            await createEvent({
              team: teamId,
              title: data.name,
              date: data.date,
              location: data.location || '',
              capacity: data.capacity,
              description: data.description,
              response_options: data.response_options,
            });
            success('Úspěch', 'Událost byla vytvořena');
            setShowCreateEvent(false);
          } catch (error: any) {
            showError('Chyba', error.message);
          }
        }}
      />

      <MemberActionsSheet
        visible={!!selectedMember}
        onClose={() => setSelectedMember(null)}
        member={selectedMember}
        onChangeRole={handleChangeRole}
        onRemoveMember={handleRemoveMember}
      />

      {/* All Events Modal */}
      <Modal
        title="Všechny akce"
        visible={showAllEvents}
        onClose={() => setShowAllEvents(false)}
        scroll={false}
      >
        <FlatList
          data={events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const date = new Date(item.date);
            const isPast = date < new Date();

            return (
              <TouchableOpacity
                style={styles.eventRow}
                onPress={() => {
                  setShowAllEvents(false);
                  router.push(`/(tabs)/events/${item.id}`);
                }}
              >
                <View style={styles.eventRowLeft}>
                  <View style={[styles.dateBadge, isPast && styles.dateBadgePast]}>
                    <Text style={styles.dateBadgeDay}>{date.getDate()}</Text>
                    <Text style={styles.dateBadgeMonth}>
                      {date.toLocaleDateString('cs-CZ', { month: 'short' }).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.eventRowInfo}>
                    <Text style={[styles.eventRowTitle, isPast && styles.eventRowTitlePast]}>
                      {item.title}
                    </Text>
                    <Text style={styles.eventRowMeta}>
                      {date.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}
                      {item.location && ` • ${item.location}`}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyModal}>
              <Text style={styles.emptyModalText}>Žádné akce</Text>
            </View>
          }
        />
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFF4',
  },
  eventRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  dateBadge: {
    width: 48,
    height: 48,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateBadgePast: {
    backgroundColor: '#8E8E93',
  },
  dateBadgeDay: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  dateBadgeMonth: {
    fontSize: 9,
    fontWeight: '600',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  eventRowInfo: {
    flex: 1,
    gap: 4,
  },
  eventRowTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  eventRowTitlePast: {
    color: '#8E8E93',
  },
  eventRowMeta: {
    fontSize: 13,
    color: '#8E8E93',
  },
  emptyModal: {
    padding: 40,
    alignItems: 'center',
  },
  emptyModalText: {
    fontSize: 16,
    color: '#8E8E93',
  },
});