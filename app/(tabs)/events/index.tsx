import { useTeams } from '@/hooks';
import { eventsAPI } from '@/lib/api';
import type { Event } from '@/lib/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function EventsListScreen() {
  const { teams } = useTeams();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchAllEvents = async () => {
    try {
      // Načti akce ze všech týmů
      const allEvents: Event[] = [];

      for (const team of teams) {
        const teamEvents = await eventsAPI.getTeamEvents(team.id);
        allEvents.push(...teamEvents);
      }

      // Seřaď podle data (nejnovější první)
      allEvents.sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setEvents(allEvents);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (teams.length > 0) {
      fetchAllEvents();
    } else {
      setIsLoading(false);
    }
  }, [teams]);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchAllEvents();
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <EventCard
            event={item}
            onPress={() => router.push(`/(tabs)/events/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyText}>
              {teams.length === 0
                ? 'Zatím nejsi členem žádného týmu'
                : 'Žádné nadcházející akce'
              }
            </Text>
          </View>
        }
      />
    </View>
  );
}

interface EventCardProps {
  event: Event;
  onPress: () => void;
}

function EventCard({ event, onPress }: EventCardProps) {
  const dateObj = new Date(event.date);
  const now = new Date();
  const isPast = dateObj < now;

  // Formátování data
  const dateStr = dateObj.toLocaleDateString('cs-CZ', {
    day: 'numeric',
    month: 'long',
    year: dateObj.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
  const timeStr = dateObj.toLocaleTimeString('cs-CZ', {
    hour: '2-digit',
    minute: '2-digit'
  });

  // Spočítej obsazenost (bez dělení nulou) — kapacita 0 znamená neomezeno
  const responses = event.expand?.event_responses_via_event || [];
  const responseOptions = event.response_options || [];
  const capacityOptions = responseOptions
    .filter((opt) => opt.countsToCapacity)
    .map((opt) => opt.label);

  const confirmedCount = responses.filter((r) =>
    capacityOptions.includes(r.response)
  ).length;

  // Kapacita 0 považujeme za "neomezeno" — zabraň dělení nulou
  const capacity = event.capacity ?? 0;
  const percentage = capacity === 0 ? 100 : (confirmedCount / capacity) * 100;
  const isFull = capacity !== 0 && confirmedCount >= capacity;

  return (
    <TouchableOpacity
      style={[styles.card, isPast && styles.cardPast]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Header s datem */}
      <View style={styles.eventHeader}>
        <View style={styles.dateBox}>
          <Text style={styles.dateDay}>
            {dateObj.getDate()}
          </Text>
          <Text style={styles.dateMonth}>
            {dateObj.toLocaleDateString('cs-CZ', { month: 'short' }).toUpperCase()}
          </Text>
        </View>

        <View style={styles.eventInfo}>
          <Text style={[styles.eventTitle, isPast && styles.textPast]}>
            {event.title}
          </Text>
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

      {/* Kapacita */}
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
            {capacity === 0 ? `${confirmedCount}/∞` : `${confirmedCount}/${capacity}`}
          </Text>
      </View>

      {/* Team badge */}
      {event.expand?.team && (
        <View style={styles.teamBadge}>
          <Text style={styles.teamBadgeIcon}>{event.expand.team.icon}</Text>
          <Text style={styles.teamBadgeName}>{event.expand.team.name}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 20,
  },
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
  cardPast: {
    opacity: 0.6,
  },
  eventHeader: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 16,
  },
  dateBox: {
    width: 60,
    height: 60,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateDay: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  dateMonth: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  eventInfo: {
    flex: 1,
    gap: 4,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
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
  pastBadge: {
    height: 28,
    paddingHorizontal: 12,
    backgroundColor: '#F0F0F0',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pastBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
  },
  capacitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  capacityBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  capacityFill: {
    height: '100%',
    backgroundColor: '#34C759',
    borderRadius: 3,
  },
  capacityFillFull: {
    backgroundColor: '#FF3B30',
  },
  capacityFillPast: {
    backgroundColor: '#8E8E93',
  },
  capacityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    minWidth: 50,
    textAlign: 'right',
  },
  textPast: {
    color: '#8E8E93',
  },
  teamBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  teamBadgeIcon: {
    fontSize: 16,
  },
  teamBadgeName: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '500',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
});