import { EventCard } from '@/components/events/EventCard';
import { useTeams } from '@/hooks';
import { eventsAPI, responsesAPI } from '@/lib/api';
import type { Event, EventResponse } from '@/lib/types';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text, View
} from 'react-native';

export default function EventsListScreen() {
  const { teams, isLoading: teamsLoading } = useTeams();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [eventResponses, setEventResponses] = useState<Record<string, EventResponse[]>>({});
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchAllEvents = useCallback(async () => {
    setIsLoadingEvents(true);
    try {
      // Načti akce ze všech týmů
      const allEvents: Event[] = [];

      for (const team of teams) {
        try {
          const teamEvents = await eventsAPI.getTeamEvents(team.id);
          allEvents.push(...teamEvents);
        } catch (error) {
          // Tiše ignoruj chyby u jednotlivých týmů - může se stát při hot reload
          console.warn(`Skipping team ${team.id} due to error:`, error);
        }
      }

      // Načti responses pro každou akci zvlášť
      const responsesMap: Record<string, EventResponse[]> = {};
      for (const event of allEvents) {
        try {
          const responses = await responsesAPI.getEventResponses(event.id);
          responsesMap[event.id] = responses;
        } catch (error) {
          // Tiché ignorování chyb - může se stát při hot reload
          responsesMap[event.id] = [];
        }
      }

      // Filtruj akce do 3 měsíců zpět
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      const recentEvents = allEvents.filter((event) => {
        return new Date(event.date) >= threeMonthsAgo;
      });

      // Seřaď podle data - upcoming events soonest first, then past events most recent first
      const now = new Date();
      const upcoming = recentEvents.filter(e => new Date(e.date) >= now);
      const past = recentEvents.filter(e => new Date(e.date) < now);

      // Sort upcoming: soonest first (ascending)
      upcoming.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Sort past: most recent first (descending)
      past.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      // Combine: upcoming first, then past
      const sortedEvents = [...upcoming, ...past];

      setEvents(sortedEvents);
      setEventResponses(responsesMap);
    } catch (error) {
      console.warn('Failed to fetch events:', error);
    } finally {
      setIsLoadingEvents(false);
      setIsRefreshing(false);
    }
  }, [teams]);

  useEffect(() => {
    if (teams.length > 0) {
      fetchAllEvents().catch(err => {
        // Tiše ignoruj chyby při initial load
        console.warn('Error loading events:', err);
      });
    }
  }, [teams]);

  // Refresh events when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (teams.length > 0) {
        fetchAllEvents().catch(err => {
          // Tiše ignoruj chyby při focus refresh
          console.warn('Error refreshing events on focus:', err);
        });
      }
    }, [teams, fetchAllEvents])
  );

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchAllEvents().catch(err => {
      console.warn('Error refreshing events:', err);
    });
  };

  // Show loading spinner if teams or events are loading
  const isLoading = teamsLoading || isLoadingEvents;

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // Rozděl na nadcházející a proběhlé
  const now = new Date();
  const upcomingEvents = events.filter(e => new Date(e.date) >= now);
  const pastEvents = events.filter(e => new Date(e.date) < now);

  return (
    <View style={styles.container}>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          events.length > 0 ? (
            <>
              {upcomingEvents.length > 0 && (
                <Text style={styles.sectionTitle}>Nadcházející akce</Text>
              )}
            </>
          ) : null
        }
        renderItem={({ item, index }) => {
          // Zobraz "Proběhlé akce" header před první proběhlou akcí
          const isPast = new Date(item.date) < now;
          const prevItem = index > 0 ? events[index - 1] : null;
          const prevIsPast = prevItem ? new Date(prevItem.date) < now : false;
          const showPastHeader = isPast && !prevIsPast;

          return (
            <>
              {showPastHeader && (
                <Text style={styles.sectionTitle}>Proběhlé akce</Text>
              )}
              <EventCard
                event={item}
                responses={eventResponses[item.id] || []}
                onPress={() => router.push(`/(tabs)/events/${item.id}`)}
              />
            </>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyText}>
              {teams.length === 0
                ? 'Zatím nejsi členem žádného týmu'
                : 'Žádné akce za poslední 3 měsíce'
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
  responses: EventResponse[];
  onPress: () => void;
}

// EventCard moved to components/events/EventCard.tsx

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
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
    marginTop: 8,
  },
});