import Modal from '@/components/common/Modal';
import { useAlert } from '@/hooks';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface EditNameModalProps {
  visible: boolean;
  onClose: () => void;
  currentName: string;
  onUpdate: (name: string) => Promise<void>;
}

export function EditNameModal({ visible, onClose, currentName, onUpdate }: EditNameModalProps) {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { error: showError } = useAlert();

  useEffect(() => {
    if (visible) {
      setName(currentName);
    }
  }, [visible, currentName]);

  const handleSave = async () => {
    if (!name.trim()) {
      showError('Chyba', 'Zadej jméno');
      return;
    }

    if (name.trim() === currentName) {
      onClose();
      return;
    }

    setIsLoading(true);
    try {
      await onUpdate(name.trim());
      onClose();
    } catch (err: any) {
      showError('Chyba', err.message || 'Nepodařilo se změnit jméno');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal title="Změnit jméno" visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <Text style={styles.label}>Nové jméno</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Tvoje jméno"
          autoFocus
          editable={!isLoading}
        />

        <View style={styles.buttons}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onClose}
            disabled={isLoading}
          >
            <Text style={styles.cancelButtonText}>Zrušit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.saveButton, isLoading && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={isLoading}
          >
            <Text style={styles.saveButtonText}>
              {isLoading ? 'Ukládám...' : 'Uložit'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: -8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1A1A1A',
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
