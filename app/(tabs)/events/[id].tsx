import Modal from '@/components/common/Modal';
import { EditEventModal } from '@/components/events/EditEventModal';
import { useAlert, useAuth, useEvent, useTeam } from '@/hooks';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { event, responses, isLoading, setMyResponse, addGuest, deleteResponse, updateEvent, deleteEvent } = useEvent(id);
  const { user } = useAuth();
  const { success, error: showError, confirm } = useAlert();

  // Get team members to check if user is admin
  const teamId = event?.team;
  const { members } = useTeam(teamId || null);

  const [showGuestModal, setShowGuestModal] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestOption, setGuestOption] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

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

  // Check if event is in the past
  const isPastEvent = new Date(event.date) < new Date();

  // Check if user can edit (creator or team admin, and event hasn't passed)
  const isCreator = event.created_by === user?.id;
  const currentMember = members.find(m => m.user === user?.id);
  const isTeamAdmin = currentMember?.role === 'admin';
  const canEdit = !isPastEvent && (isCreator || isTeamAdmin);

  const handleDeleteEvent = async () => {
    try {
      if (!event?.id) return;

      const ok = await confirm(
        'Smazat akci',
        `Opravdu chceš akci "${event.title}" trvale smazat? Tato akce je nevratná.`,
        'Smazat',
        'Zrušit'
      );

      if (!ok) return;

      await deleteEvent(event.id);
      success('Úspěch', 'Akce byla smazána');
      router.back();
    } catch (error: any) {
      showError('Chyba', error.message);
    }
  };

  return (
    <>
    <ScrollView style={styles.container}>
      {/* Header Info */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{event.title}</Text>
          {canEdit && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                onPress={() => setShowEditModal(true)}
                style={styles.iconButton}
              >
                <Ionicons name="create-outline" size={24} color="#007AFF" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDeleteEvent}
                style={styles.iconButton}
              >
                <Ionicons name="trash-outline" size={24} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          )}
        </View>
        <View style={styles.headerRow}>
          <Ionicons name="calendar" size={16} color="#8E8E93" />
          <Text style={styles.subtitle}>{new Date(event.date).toLocaleTimeString('cs-CZ', {hour: '2-digit', minute: '2-digit'}) + "  " + new Date(event.date).toLocaleDateString('cs-CZ')}</Text>
        </View>

        {event.location && (
          <View style={styles.headerRow}>
            <Ionicons name="location" size={16} color="#8E8E93" />
            <Text style={styles.meta}>{event.location}</Text>
          </View>
        )}

        {event.description && (
          <Text style={styles.description}>{event.description}</Text>
        )}

        {isPastEvent && (
          <View style={styles.pastBadge}>
            <Text style={styles.pastBadgeText}>Akce proběhla</Text>
          </View>
        )}
      </View>

      {/* Tvoje účast - Card */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Tvoje účast</Text>
        {isPastEvent && (
          <Text style={styles.pastEventNotice}>Akce již proběhla - nelze měnit účast</Text>
        )}
        <View style={styles.optionsGrid}>
          {responseOptions.map((item) => {
            const isSelected = responses.some(r => r.user === user?.id && r.response === item.label);
            const colorHex = getColorHex(item.color);
            return (
              <TouchableOpacity
                key={String(item.id)}
                disabled={isPastEvent}
                style={[
                  styles.optionButton,
                  {
                    borderColor: colorHex,
                    backgroundColor: isSelected ? colorHex : '#FFF',
                    opacity: isPastEvent ? 0.5 : 1,
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

        {!isPastEvent && (
          <TouchableOpacity style={styles.addGuestButton} onPress={() => setShowGuestModal(true)}>
            <Text style={styles.addGuestText}>Přidat hosta</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Účastníci - Card */}
      <View style={styles.card}>
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
                  {opt.countsToCapacity ? ' • počítá se do kapacity' : ''}
                </Text>
              </View>

              {list.map((r) => (
                <View key={r.id} style={styles.responseRow}>
                  <Text style={styles.responseName}>{r.expand?.user?.name || r.guest_name || 'Neznámý'}</Text>
                  <Text style={styles.responseMeta}>{new Date(r.updated).toLocaleString('cs-CZ')}</Text>
                  {/* allow deleting only guests (added by current user) */}
                  {r.guest_name && r.added_by === user?.id && (
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
    </ScrollView>

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

      {/* Edit event modal */}
      {event && (
        <EditEventModal
          visible={showEditModal}
          onClose={() => setShowEditModal(false)}
          event={event}
          onUpdate={async (data) => {
            try {
              await updateEvent(id, data);
              success('Úspěch', 'Událost byla aktualizována');
              setShowEditModal(false);
            } catch (error: any) {
              showError('Chyba', error.message);
            }
          }}
        />
      )}
    </>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#FF3B30' },
  header: {
    padding: 20,
    gap: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: { fontSize: 24, fontWeight: '700', color: '#1A1A1A', flex: 1 },
  actionButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  iconButton: {
    padding: 8,
  },
  editButton: {
    padding: 8,
    marginLeft: 8,
  },
  subtitle: { fontSize: 14, color: '#8E8E93' },
  meta: { fontSize: 14, color: '#8E8E93' },
  description: { marginTop: 6, fontSize: 15, color: '#1A1A1A', lineHeight: 22 },
  pastBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FF9500',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 8,
  },
  pastBadgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 12,
    marginBottom: 12,
    padding: 20,
    borderRadius: 12,
    gap: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A' },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  optionButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: '45%',
    borderWidth: 2,
  },
  optionLabel: { fontSize: 16, fontWeight: '600' },
  addGuestButton: { padding: 12, backgroundColor: '#F5F5F5', borderRadius: 12, alignItems: 'center' },
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
  pastEventNotice: { fontSize: 14, color: '#FF9500', marginBottom: 8, fontStyle: 'italic' },
});