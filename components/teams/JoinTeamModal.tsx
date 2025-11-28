import useAlert from '@/hooks/useAlert';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Modal from '../common/Modal';

interface JoinTeamModalProps {
  visible: boolean;
  onClose: () => void;
  onJoin: (code: string) => Promise<void>;
}

export function JoinTeamModal({ visible, onClose, onJoin }: JoinTeamModalProps) {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { error: showError } = useAlert();

  const handleJoin = async () => {
    if (!code.trim()) {
      showError('Chyba', 'Zadej pozvánkový kód');
      return;
    }

    if (code.length !== 6) {
      showError('Chyba', 'Pozvánkový kód má 6 znaků');
      return;
    }

    setIsLoading(true);
    try {
      await onJoin(code.toUpperCase());
      setCode('');
      onClose();
    } catch (error: any) {
      showError('Chyba', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      title="Připojit se k týmu"
      subtitle="Zadej 6místný kód od správce týmu"
      visible={visible}
      onClose={onClose}
    >
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="ABC123"
          value={code}
          onChangeText={(text) => setCode(text.toUpperCase())}
          maxLength={6}
          autoCapitalize="characters"
          autoCorrect={false}
          editable={!isLoading}
        />

        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleJoin}
          disabled={isLoading}
        >
          <Text style={styles.primaryButtonText}>
            {isLoading ? 'Připojuji...' : 'Připojit se'}
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
  input: {
    width: '100%',
    padding: 20,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 8,
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