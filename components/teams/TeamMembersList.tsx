import type { TeamMember } from '@/lib/types';
import { Ionicons } from '@expo/vector-icons';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TeamMembersListProps {
  members: TeamMember[];
  currentUserId: string;
  canManageMembers: boolean;
  onMemberPress?: (member: TeamMember) => void;
}

export function TeamMembersList({
  members,
  currentUserId,
  canManageMembers,
  onMemberPress
}: TeamMembersListProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Členové ({members.length})</Text>

      <FlatList
        data={members}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.memberCard}
            onPress={() => onMemberPress?.(item)}
            disabled={!canManageMembers || item.user === currentUserId}
          >
            <View style={styles.memberAvatar}>
              <Text style={styles.memberAvatarText}>
                {item.expand?.user?.name?.charAt(0).toUpperCase() || '?'}
              </Text>
            </View>

            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>
                {item.expand?.user?.name}
                {item.user === currentUserId && (
                  <Text style={styles.youBadge}> (Ty)</Text>
                )}
              </Text>
            </View>

            <View style={[
              styles.roleBadge,
              item.role === 'admin' && styles.roleBadgeAdmin
            ]}>
              <Text style={[
                styles.roleText,
                item.role === 'admin' && styles.roleTextAdmin
              ]}>
                {item.role === 'admin' ? 'Admin' : 'Člen'}
              </Text>
            </View>

            {canManageMembers && item.user !== currentUserId && (
              <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    margin: 12,
    borderRadius: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberAvatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  youBadge: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },
  roleBadgeAdmin: {
    backgroundColor: '#E3F2FD',
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
  },
  roleTextAdmin: {
    color: '#007AFF',
  },
});