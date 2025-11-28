import useAlert from '@/hooks/useAlert';
import type { Team } from '@/lib/types';
import { Ionicons } from '@expo/vector-icons';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Modal from '../common/Modal';

interface TeamSettingsSheetProps {
  visible: boolean;
  onClose: () => void;
  team: Team;
  isCreator: boolean;
  onEditTeam: () => void;
  onLeaveTeam: () => void;
  onDeleteTeam: () => void;
}

export function TeamSettingsSheet({
  visible,
  onClose,
  team,
  isCreator,
  onEditTeam,
  onLeaveTeam,
  onDeleteTeam,
}: TeamSettingsSheetProps) {
  const { confirm } = useAlert();

  const handleLeave = async () => {
    const ok = await confirm(
      'Opustit tým',
      `Opravdu chceš opustit tým ${team.name}?`,
      'Opustit',
      'Zrušit'
    );

    if (ok) {
      onLeaveTeam();
      onClose();
    }
  };

  const handleDelete = async () => {
    const ok = await confirm(
      'Smazat tým',
      `Opravdu chceš tým ${team.name} trvale smazat? Tato akce je nevratná.`,
      'Smazat',
      'Zrušit'
    );

    if (ok) {
      onDeleteTeam();
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      scroll
      title="Nastavení týmu"
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Správa</Text>

        {/* Edit Team */}
        <TouchableOpacity
          style={styles.item}
          onPress={() => {
            onEditTeam();
            onClose();
          }}
        >
          <View style={styles.itemIcon}>
            <Ionicons name="pencil-outline" size={20} color="#007AFF" />
          </View>
          <Text style={styles.itemText}>Upravit tým</Text>
          <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Nebezpečná zóna</Text>

        {/* Leave Team */}
        {!isCreator && (
          <TouchableOpacity style={styles.item} onPress={handleLeave}>
            <View style={[styles.itemIcon, styles.itemIconDanger]}>
              <Ionicons name="exit-outline" size={20} color="#FF3B30" />
            </View>
            <Text style={[styles.itemText, styles.itemTextDanger]}>
              Opustit tým
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>
        )}

        {/* Delete Team (only creator) */}
        {isCreator && (
          <TouchableOpacity style={styles.item} onPress={handleDelete}>
            <View style={[styles.itemIcon, styles.itemIconDanger]}>
              <Ionicons name="trash-outline" size={20} color="#FF3B30" />
            </View>
            <Text style={[styles.itemText, styles.itemTextDanger]}>
              Smazat tým
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
          </TouchableOpacity>
        )}

        {isCreator && (
          <Text style={styles.warningText}>
            ⚠️ Smazání týmu je nevratné. Budou smazány všechny akce a
            data týmu.
          </Text>
        )}
      </View>

      <View style={styles.bottomSpacer} />
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
    minHeight: '40%',
    maxHeight: '80%',
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
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  itemIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemIconDanger: {
    backgroundColor: '#FFE5E5',
  },
  itemText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  itemTextDanger: {
    color: '#FF3B30',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 16,
  },
  warningText: {
    fontSize: 13,
    color: '#8E8E93',
    lineHeight: 18,
    marginTop: 8,
    paddingHorizontal: 44,
  },
  bottomSpacer: {
    height: Platform.OS === 'ios' ? 40 : 20,
  },
});