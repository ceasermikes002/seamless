import { EventCard } from '@/components/EventCard';
import { GlassCard } from '@/components/ui/GlassCard';
import { useEvents } from '@/contexts/EventContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Event } from '@/types';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EventsListScreen() {
  const router = useRouter();
  const { events, loading, refreshEvents, removeEvent } = useEvents();
  const { isDark } = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshEvents();
    setRefreshing(false);
  }, [refreshEvents]);

  const handleEventPress = (event: Event) => {
    router.push(`/edit/${event.id}`);
  };

  const handleEventEdit = (event: Event) => {
    router.push(`/edit/${event.id}`);
  };

  const handleEventDelete = (eventId: string) => {
    removeEvent(eventId);
  };

  const handleAddEvent = () => {
    // Create a new empty event
    const newEvent: Event = {
      id: Date.now().toString(),
      title: 'New Event',
      date: new Date(),
      category: 'appointment',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    router.push(`/edit/${newEvent.id}`);
  };

  const todayEvents = events.filter(event => {
    const today = new Date();
    const eventDate = new Date(event.date);
    return eventDate.toDateString() === today.toDateString();
  });

  const upcomingEvents = events.filter(event => {
    const today = new Date();
    const eventDate = new Date(event.date);
    return eventDate > today;
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const pastEvents = events.filter(event => {
    const today = new Date();
    const eventDate = new Date(event.date);
    return eventDate < today && eventDate.toDateString() !== today.toDateString();
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <View style={styles.header}>
          <Text style={[styles.title, isDark && styles.darkText]}>Events</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, isDark && styles.darkSubtext]}>Loading events...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <View style={styles.header}>
        <Text style={[styles.title, isDark && styles.darkText]}>Events</Text>
        <Text style={[styles.subtitle, isDark && styles.darkSubtext]}>
          {events.length} total event{events.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={isDark ? ['#8B5CF6'] : ['#6B46C1']}
            tintColor={isDark ? '#8B5CF6' : '#6B46C1'}
          />
        }
      >
        {todayEvents.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Today</Text>
            {todayEvents.map(event => (
              <EventCard
                key={event.id}
                event={event}
                onPress={() => handleEventPress(event)}
                onEdit={() => handleEventEdit(event)}
                onDelete={() => handleEventDelete(event.id)}
              />
            ))}
          </View>
        )}

        {upcomingEvents.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Upcoming</Text>
            {upcomingEvents.map(event => (
              <EventCard
                key={event.id}
                event={event}
                onPress={() => handleEventPress(event)}
                onEdit={() => handleEventEdit(event)}
                onDelete={() => handleEventDelete(event.id)}
              />
            ))}
          </View>
        )}

        {pastEvents.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, isDark && styles.darkText]}>Past</Text>
            {pastEvents.map(event => (
              <EventCard
                key={event.id}
                event={event}
                onPress={() => handleEventPress(event)}
                onEdit={() => handleEventEdit(event)}
                onDelete={() => handleEventDelete(event.id)}
              />
            ))}
          </View>
        )}

        {events.length === 0 && (
          <GlassCard style={[styles.emptyCard, isDark && styles.darkEmptyCard]}>
            <View style={styles.emptyContent}>
              <Text style={[styles.emptyTitle, isDark && styles.darkText]}>No events yet</Text>
              <Text style={[styles.emptyText, isDark && styles.darkSubtext]}>
                Events will appear here when you parse emails or add them manually.
              </Text>
            </View>
          </GlassCard>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={handleAddEvent}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  darkContainer: {
    backgroundColor: '#111827',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  darkHeader: {
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginHorizontal: 20,
    marginBottom: 12,
    marginTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  emptyCard: {
    marginHorizontal: 20,
    marginVertical: 40,
  },
  darkEmptyCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  emptyContent: {
    padding: 24,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6B46C1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '300',
  },
  darkText: {
    color: '#F9FAFB',
  },
  darkSubtext: {
    color: '#9CA3AF',
  },
});