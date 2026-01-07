import type { EventResponse, Event as EventType } from '@/lib/types';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface EventCardProps {
  event: EventType;
  responses: EventResponse[];
  onPress: () => void;
}

export function EventCard({ event, responses, onPress }: EventCardProps) {
  const dateObj = new Date(event.date);
  const now = new Date();
  const isPast = dateObj < now;

  const timeStr = dateObj.toLocaleTimeString('cs-CZ', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const responseOptions = event.response_options || [];
  const capacityOptions = responseOptions
    .filter((opt) => opt.countsToCapacity)
    .map((opt) => opt.label);

  const confirmedCount = responses.filter((r) =>
    capacityOptions.includes(r.response)
  ).length;

  const capacity = event.capacity ?? 0;
  const percentage = capacity === 0 ? 100 : (confirmedCount / capacity) * 100;
  const isFull = capacity !== 0 && confirmedCount >= capacity;

  return (
    <TouchableOpacity
      style={[styles.card, isPast && styles.cardPast]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.eventHeader}>
        <View style={styles.dateBox}>
          <Text style={styles.dateDay}>{dateObj.getDate()}</Text>
          <Text style={styles.dateMonth}>{dateObj.toLocaleDateString('cs-CZ', { month: 'short' }).toUpperCase()}</Text>
        </View>

        <View style={styles.eventInfo}>
          <Text style={[styles.eventTitle, isPast && styles.textPast]}>{event.title}</Text>
          <View style={styles.eventMeta}>
            <Ionicons name="time-outline" size={14} color="#8E8E93" />
            <Text style={styles.metaText}>{timeStr}</Text>
          </View>
          <View style={styles.eventMeta}>
            <Ionicons name="location-outline" size={14} color="#8E8E93" />
            <Text style={styles.metaText}>{event.location}</Text>
          </View>
        </View>

        {isPast && (
          <View style={styles.pastBadge}>
            <Text style={styles.pastBadgeText}>Proběhlo</Text>
          </View>
        )}
      </View>

      {capacity === 0 ? (
        <View style={styles.capacitySection}>
          <Text style={[styles.capacityText, isPast && styles.textPast]}>
            {confirmedCount} přihlášeno • Neomezená kapacita
          </Text>
        </View>
      ) : (
        <View style={styles.capacitySection}>
          <View style={styles.capacityBar}>
            <View
              style={[
                styles.capacityFill,
                isFull && styles.capacityFillFull,
                isPast && styles.capacityFillPast,
              ]}
              // @ts-ignore
              width={`${Math.min(percentage, 100)}%`}
            />
          </View>
          <Text style={[styles.capacityText, isPast && styles.textPast]}>
            {confirmedCount}/{capacity}
          </Text>
        </View>
      )}

      {event.expand?.team && (
        <View style={styles.teamBadge}>
          <Text style={styles.teamBadgeName}>{event.expand.team.name}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardPast: { opacity: 0.6 },
  eventHeader: { flexDirection: 'row', marginBottom: 16, gap: 16 },
  dateBox: { width: 60, height: 60, backgroundColor: '#007AFF', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  dateDay: { fontSize: 24, fontWeight: '700', color: '#FFFFFF' },
  dateMonth: { fontSize: 11, fontWeight: '600', color: '#FFFFFF', opacity: 0.9 },
  eventInfo: { flex: 1, gap: 4 },
  eventTitle: { fontSize: 18, fontWeight: '600', color: '#1A1A1A', marginBottom: 4 },
  eventMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 14, color: '#8E8E93' },
  pastBadge: { height: 28, paddingHorizontal: 12, backgroundColor: '#F0F0F0', borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  pastBadgeText: { fontSize: 12, fontWeight: '600', color: '#8E8E93' },
  capacitySection: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  capacityBar: { flex: 1, height: 6, backgroundColor: '#F0F0F0', borderRadius: 3, overflow: 'hidden' },
  capacityFill: { height: '100%', backgroundColor: '#34C759', borderRadius: 3 },
  capacityFillFull: { backgroundColor: '#FF3B30' },
  capacityFillPast: { backgroundColor: '#8E8E93' },
  capacityText: { fontSize: 14, fontWeight: '600', color: '#1A1A1A', minWidth: 50, textAlign: 'right' },
  textPast: { color: '#8E8E93' },
  teamBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  teamBadgeName: { fontSize: 13, color: '#8E8E93', fontWeight: '500' },
});
