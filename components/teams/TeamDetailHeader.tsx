import { useAlert } from '@/hooks';
import type { Team } from '@/lib/types';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TeamDetailHeaderProps {
  team: Team;
  memberCount: number;
  isAdmin: boolean;
  onSettingsPress: () => void;
}

export function TeamDetailHeader({
  team,
  memberCount,
  isAdmin,
  onSettingsPress
}: TeamDetailHeaderProps) {
  const [showCode, setShowCode] = useState(false);

  const { success } = useAlert();

  const handleCopyCode = async () => {
    await Clipboard.setStringAsync(team.invite_code);
    success('Zkopírováno', `Kód ${team.invite_code} byl zkopírován`);
  };

  const handleShareCode = async () => {
    try {
      await Share.share({
        message: `Připoj se k týmu ${team.name}!\n\nKód: ${team.invite_code}`,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Avatar & Info */}
      <View style={styles.header}>
        <View style={styles.info}>
          <Text style={styles.name}>{team.name}</Text>
          <Text style={styles.memberCount}>{memberCount} členů</Text>
        </View>
        {isAdmin && (
          <TouchableOpacity style={styles.settingsButton} onPress={onSettingsPress}>
            <Ionicons name="settings-outline" size={24} color="#007AFF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Description */}
      {team.description && (
        <Text style={styles.description}>{team.description}</Text>
      )}

      {/* Invite Code */}
      <View style={styles.codeSection}>
        <View style={styles.codeHeader}>
          <Text style={styles.codeLabel}>Pozvánkový kód</Text>
          <TouchableOpacity onPress={() => setShowCode(!showCode)}>
            <Ionicons
              name={showCode ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color="#8E8E93"
            />
          </TouchableOpacity>
        </View>

        {showCode ? (
          <View style={styles.codeActions}>
            <View style={styles.codeBox}>
              <Text style={styles.codeText}>{team.invite_code}</Text>
            </View>
            <TouchableOpacity style={styles.iconButton} onPress={handleCopyCode}>
              <Ionicons name="copy-outline" size={20} color="#007AFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={handleShareCode}>
              <Ionicons name="share-outline" size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>
        ) : ""}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    gap: 20,
    borderRadius: 12,
    margin: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  memberCount: {
    fontSize: 15,
    color: '#8E8E93',
  },
  settingsButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  description: {
    fontSize: 15,
    color: '#1A1A1A',
    lineHeight: 22,
  },
  codeSection: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  codeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  codeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  codeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  codeBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
  },
  codeText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    letterSpacing: 4,
  },
  hiddenCode: {
    fontSize: 24,
    fontWeight: '700',
    color: '#C7C7CC',
    textAlign: 'center',
    letterSpacing: 4,
  },
  iconButton: {
    width: 40,
    height: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
});