import Modal from '@/components/common/Modal';
import { useAlert, useAuth, useEvent } from '@/hooks';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { event, responses, isLoading, setMyResponse, addGuest, deleteResponse } = useEvent(id);
  const { user } = useAuth();
  const { success, error: showError } = useAlert();

  const [showGuestModal, setShowGuestModal] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestOption, setGuestOption] = useState<string | null>(null);

  // Helper to get color hex from color name
  const getColorHex = (colorName: string) => {
    const colors: Record<string, string> = {
      green: '#5fd08d',
      red: '#ff6b6b',
      blue: '#4aa3ff',
      yellow: '#ffd166',
      purple: '#b285ff',
    };
    return colors[colorName] || '#007AFF';
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Akce nenalezena</Text>
      </View>
    );
  }

  // Helper to count responses for an option
  const responseOptions = event.response_options || [];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{event.title}</Text>
      <Text style={styles.subtitle}>{new Date(event.date).toLocaleString('cs-CZ')}</Text>

      {event.location ? (
        <Text style={styles.meta}>📍 {event.location}</Text>
      ) : null}

      {event.description ? (
        <Text style={styles.description}>{event.description}</Text>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tvoje účast</Text>
        <View style={styles.optionsGrid}>
          {responseOptions.map((item) => {
            const isSelected = responses.some(r => r.user === user?.id && r.response === item.label);
            const colorHex = getColorHex(item.color);
            return (
              <TouchableOpacity
                key={String(item.id)}
                style={[
                  styles.optionButton,
                  {
                    borderColor: colorHex,
                    backgroundColor: isSelected ? colorHex : '#FFF',
                  }
                ]}
                onPress={async () => {
                  try {
                    await setMyResponse(item.label);
                  } catch (e: any) {
                    showError('Chyba', e.message || 'Nepodařilo se aktualizovat účast');
                  }
                }}
              >
                <Text style={[styles.optionLabel, { color: isSelected ? '#FFF' : '#1A1A1A' }]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity style={styles.addGuestButton} onPress={() => setShowGuestModal(true)}>
          <Text style={styles.addGuestText}>Přidat hosta</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Účastníci</Text>
        {responseOptions.map((opt) => {
          const list = responses.filter(r => r.response === opt.label);
          if (list.length === 0) return null;
          return (
            <View key={String(opt.id)} style={styles.responseGroup}>
              <View style={styles.responseGroupHeader}>
                <View style={[styles.swatchSmall, (styles as any)[`color_${opt.color}`]]} />
                <Text style={styles.responseGroupTitle}>
                  {opt.label} ({list.length})
                  {opt.countsToCapacity ? ' • počítá do kapacity' : ''}
                </Text>
              </View>

              {list.map((r) => (
                <View key={r.id} style={styles.responseRow}>
                  <Text style={styles.responseName}>{r.expand?.user?.name || r.guest_name || 'Neznámý'}</Text>
                  <Text style={styles.responseMeta}>{new Date(r.created).toLocaleString('cs-CZ')}</Text>
                  {/* allow deleting own responses */}
                  {(r.user === user?.id || r.added_by === user?.id) && (
                    <TouchableOpacity onPress={() => deleteResponse(r.id)} style={styles.smallTrash}>
                      <Ionicons name="trash-outline" size={16} color="#FF3B30" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          );
        })}
      </View>

      {/* Add guest modal */}
      <Modal title="Přidat hosta" visible={showGuestModal} onClose={() => setShowGuestModal(false)}>
        <View style={{ gap: 12 }}>
          <TextInput value={guestName} onChangeText={setGuestName} placeholder="Jméno hosta" style={styles.input} />

          <FlatList
            data={responseOptions}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.optionRowSelect, guestOption === item.label && styles.optionRowSelectActive]}
                onPress={() => setGuestOption(item.label)}
              >
                <View style={[styles.swatchSmall, (styles as any)[`color_${item.color}`]]} />
                <Text style={styles.optionLabel}>{item.label}</Text>
              </TouchableOpacity>
            )}
          />

          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={async () => {
              if (!guestName.trim() || !guestOption) return;
              try {
                await addGuest(guestName.trim(), guestOption);
                setGuestName('');
                setGuestOption(null);
                setShowGuestModal(false);
              } catch (err) {
                // handled by hook alerts
              }
            }}
          >
            <Text style={styles.primaryButtonText}>Přidat hosta</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#FF3B30' },
  title: { fontSize: 24, fontWeight: '700', color: '#1A1A1A', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#8E8E93' },
  meta: { marginTop: 8, color: '#8E8E93' },
  description: { marginTop: 10, color: '#1A1A1A' },
  section: { marginTop: 16, gap: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  optionButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    minWidth: '45%',
    borderWidth: 2,
    minHeight: 56,
  },
  optionLabel: { fontSize: 16, fontWeight: '600' },
  addGuestButton: { marginTop: 10, padding: 12, backgroundColor: '#F5F5F5', borderRadius: 12, alignItems: 'center' },
  addGuestText: { color: '#007AFF', fontWeight: '600' },
  responseGroup: { marginTop: 12, backgroundColor: '#FFFFFF', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#EFEFF4' },
  responseGroupHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  swatchSmall: { width: 10, height: 10, borderRadius: 6, marginRight: 8 },
  responseGroupTitle: { fontSize: 16, fontWeight: '700' },
  responseRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 },
  responseName: { fontSize: 14 },
  responseMeta: { fontSize: 12, color: '#8E8E93' },
  smallTrash: { padding: 6 },
  input: { padding: 12, backgroundColor: '#F5F5F5', borderRadius: 8 },
  optionRowSelect: { padding: 10, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 6 },
  optionRowSelectActive: { borderWidth: 1, borderColor: '#007AFF' },
  button: { width: '100%', padding: 12, borderRadius: 12, alignItems: 'center' },
  primaryButton: { backgroundColor: '#007AFF', marginTop: 8 },
  primaryButtonText: { color: '#FFFFFF', fontWeight: '600' },
  color_green: { backgroundColor: '#5fd08d' },
  color_red: { backgroundColor: '#ff6b6b' },
  color_blue: { backgroundColor: '#4aa3ff' },
  color_yellow: { backgroundColor: '#ffd166' },
  color_purple: { backgroundColor: '#b285ff' },
});