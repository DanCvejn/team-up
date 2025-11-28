import type { Event } from '@/lib/types';
import { Plurals } from '@/lib/utils/pluralize';
import { Ionicons } from '@expo/vector-icons';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TeamEventsListProps {
  events: Event[];
  onEventPress: (eventId: string) => void;
  onCreatePress: () => void;
}

export function TeamEventsList({ events, onEventPress, onCreatePress }: TeamEventsListProps) {
  if (events.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📅</Text>
        <Text style={styles.emptyText}>Zatím žádné akce</Text>
        <TouchableOpacity style={styles.createButton} onPress={onCreatePress}>
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <Text style={styles.createButtonText}>Vytvořit akci</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Akce ({Plurals.eventWord(events.length)})</Text>
        <TouchableOpacity style={styles.addButton} onPress={onCreatePress}>
          <Ionicons name="add" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        renderItem={({ item }) => {
          const date = new Date(item.date);
          const isPast = date < new Date();

          return (
            <TouchableOpacity
              style={styles.eventCard}
              onPress={() => onEventPress(item.id)}
            >
              <View style={styles.dateBox}>
                <Text style={styles.dateDay}>{date.getDate()}</Text>
                <Text style={styles.dateMonth}>
                  {date.toLocaleDateString('cs-CZ', { month: 'short' }).toUpperCase()}
                </Text>
              </View>

              <View style={styles.eventInfo}>
                <Text style={[styles.eventTitle, isPast && styles.eventTitlePast]}>
                  {item.title}
                </Text>
                <View style={styles.eventMeta}>
                  <Ionicons name="time-outline" size={14} color="#8E8E93" />
                  <Text style={styles.metaText}>
                    {date.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>

              <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />
            </TouchableOpacity>
          );
        }}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  addButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 16,
  },
  dateBox: {
    width: 48,
    height: 48,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateDay: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  dateMonth: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  eventInfo: {
    flex: 1,
    gap: 4,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  eventTitlePast: {
    color: '#8E8E93',
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    padding: 40,
    alignItems: 'center',
    margin: 12,
    borderRadius: 12,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 24,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});