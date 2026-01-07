import useAlert from '@/hooks/useAlert';
import type { Team } from '@/lib/types';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Modal from '../common/Modal';

interface EditTeamModalProps {
  visible: boolean;
  onClose: () => void;
  onUpdate: (data: { name: string; description?: string }) => Promise<void>;
  team: Team | null;
}

export function EditTeamModal({ visible, onClose, onUpdate, team }: EditTeamModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { error: showError } = useAlert();

  useEffect(() => {
    if (team && visible) {
      setName(team.name);
      setDescription(team.description || '');
    }
  }, [team, visible]);

  const handleUpdate = async () => {
    if (!name.trim()) {
      showError('Chyba', 'Zadej název týmu');
      return;
    }

    setIsLoading(true);
    try {
      await onUpdate({
        name: name.trim(),
        description: description.trim() || "",
      });
      onClose();
    } catch (error: any) {
      showError('Chyba', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      title="Upravit tým"
      scroll
      visible={visible}
      onClose={onClose}
    >
      <View style={styles.form}>
        {/* Name */}
        <View style={styles.section}>
          <Text style={styles.label}>Název týmu *</Text>
          <TextInput
            style={styles.input}
            placeholder="např. FC Letná"
            value={name}
            onChangeText={setName}
            maxLength={50}
            editable={!isLoading}
          />
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.label}>Popis (volitelné)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Krátký popis týmu..."
            value={description}
            onChangeText={setDescription}
            maxLength={200}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            editable={!isLoading}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleUpdate}
          disabled={isLoading}
        >
          <Text style={styles.primaryButtonText}>
            {isLoading ? 'Ukládám...' : 'Uložit změny'}
          </Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 16,
  },
  section: {
    gap: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  input: {
    width: '100%',
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
  },
  button: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
