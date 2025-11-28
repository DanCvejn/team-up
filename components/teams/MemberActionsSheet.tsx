import { useAlert } from '@/hooks';
import type { TeamMember } from '@/lib/types';
import { Ionicons } from '@expo/vector-icons';
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface MemberActionsSheetProps {
  visible: boolean;
  onClose: () => void;
  member: TeamMember | null;
  onChangeRole: (memberId: string, newRole: 'admin' | 'member') => void;
  onRemoveMember: (memberId: string) => void;
}

export function MemberActionsSheet({
  visible,
  onClose,
  member,
  onChangeRole,
  onRemoveMember,
}: MemberActionsSheetProps) {
  if (!member) return null;

  const isAdmin = member.role === 'admin';
  const memberName = member.expand?.user?.name || 'Člen';

  const { confirm } = useAlert();

  const handleChangeRole = async () => {
    const newRole = isAdmin ? 'member' : 'admin';
    const roleText = newRole === 'admin' ? 'adminem' : 'členem';

    const ok = await confirm(
      'Změnit roli',
      `Opravdu chceš změnit ${memberName} na ${roleText}?`,
      'Změnit',
      'Zrušit'
    );

    if (ok) {
      onChangeRole(member.id, newRole);
      onClose();
    }
  };

  const handleRemove = async () => {
    const ok = await confirm(
      'Odebrat člena',
      `Opravdu chceš odebrat ${memberName} z týmu?`,
      'Odebrat',
      'Zrušit'
    );

    if (ok) {
      onRemoveMember(member.id);
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.content}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {memberName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.title}>{memberName}</Text>
            <Text style={styles.subtitle}>{member.expand?.user?.email}</Text>
          </View>

          <View style={styles.actions}>
            {/* Change Role */}
            <TouchableOpacity style={styles.action} onPress={handleChangeRole}>
              <View style={styles.actionIcon}>
                <Ionicons
                  name={isAdmin ? 'person-outline' : 'shield-checkmark-outline'}
                  size={20}
                  color="#007AFF"
                />
              </View>
              <Text style={styles.actionText}>
                {isAdmin ? 'Odebrat admin práva' : 'Povýšit na admina'}
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
            </TouchableOpacity>

            {/* Remove Member */}
            <TouchableOpacity style={styles.action} onPress={handleRemove}>
              <View style={[styles.actionIcon, styles.actionIconDanger]}>
                <Ionicons name="person-remove-outline" size={20} color="#FF3B30" />
              </View>
              <Text style={[styles.actionText, styles.actionTextDanger]}>
                Odebrat z týmu
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
            </TouchableOpacity>
          </View>

          <View style={styles.bottomSpacer} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    paddingHorizontal: 24,
    minHeight: '30%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E5E5',
    borderRadius: 2,
    alignSelf: 'center',
    marginVertical: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
  },
  actions: {
    gap: 8,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  actionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIconDanger: {
    backgroundColor: '#FFE5E5',
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  actionTextDanger: {
    color: '#FF3B30',
  },
  bottomSpacer: {
    height: Platform.OS === 'ios' ? 40 : 20,
  },
});