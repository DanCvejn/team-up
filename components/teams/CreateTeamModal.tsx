import useAlert from '@/hooks/useAlert';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Modal from '../common/Modal';

interface CreateTeamModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (data: { name: string; description?: string }) => Promise<void>;
}

export function CreateTeamModal({ visible, onClose, onCreate }: CreateTeamModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { error: showError } = useAlert();

  const handleCreate = async () => {
    if (!name.trim()) {
      showError('Chyba', 'Zadej název týmu');
      return;
    }

    setIsLoading(true);
    try {
      await onCreate({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      setName('');
      setDescription('');
      onClose();
    } catch (error: any) {
      showError('Chyba', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      title="Vytvoř nový tým"
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
          onPress={handleCreate}
          disabled={isLoading}
        >
          <Text style={styles.primaryButtonText}>
            {isLoading ? 'Vytvářím...' : 'Vytvořit tým'}
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
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  iconButton: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FD',
  },
  iconText: {
    fontSize: 28,
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
  secondaryButton: {
    backgroundColor: '#F5F5F5',
  },
  secondaryButtonText: {
    color: '#8E8E93',
    fontSize: 16,
    fontWeight: '600',
  },
});