import { EventCard } from '@/components/EventCard';
import { ThemedCard } from '@/components/ui/ThemedCard';
import { AppBar } from '@/components/ui/AppBar';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';
import { useEvents } from '@/contexts/EventContext';
import { Event } from '@/types';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography, maxContentWidth } from '@/constants/theme';

export default function EventsListScreen() {
  const router = useRouter();
  const { events, loading, refreshEvents, removeEvent } = useEvents();
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
      <View style={styles.container}>
        <StatusBar style="light" />
        <AppBar title="Events" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading events...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <AppBar title="Events" showLogo />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.accent]}
            tintColor={colors.accent}
          />
        }
      >
        <View style={styles.content}>
          {todayEvents.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Today</Text>
                <View style={[styles.countBadge, { backgroundColor: colors.accentSecondary + '30' }]}>
                  <Text style={[styles.countText, { color: colors.accentSecondary }]}>
                    {todayEvents.length}
                  </Text>
                </View>
              </View>
              {todayEvents.map((event, index) => (
                <EventCard
                  key={event.id}
                  event={event}
                  index={index}
                  onPress={() => handleEventPress(event)}
                  onEdit={() => handleEventEdit(event)}
                  onDelete={() => handleEventDelete(event.id)}
                />
              ))}
            </View>
          )}

          {upcomingEvents.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Upcoming</Text>
                <View style={[styles.countBadge, { backgroundColor: colors.accentSecondary + '30' }]}>
                  <Text style={[styles.countText, { color: colors.accentSecondary }]}>
                    {upcomingEvents.length}
                  </Text>
                </View>
              </View>
              {upcomingEvents.map((event, index) => (
                <EventCard
                  key={event.id}
                  event={event}
                  index={index}
                  onPress={() => handleEventPress(event)}
                  onEdit={() => handleEventEdit(event)}
                  onDelete={() => handleEventDelete(event.id)}
                />
              ))}
            </View>
          )}

          {pastEvents.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Past</Text>
                <View style={[styles.countBadge, { backgroundColor: colors.accentSecondary + '30' }]}>
                  <Text style={[styles.countText, { color: colors.accentSecondary }]}>
                    {pastEvents.length}
                  </Text>
                </View>
              </View>
              {pastEvents.map((event, index) => (
                <EventCard
                  key={event.id}
                  event={event}
                  index={index}
                  onPress={() => handleEventPress(event)}
                  onEdit={() => handleEventEdit(event)}
                  onDelete={() => handleEventDelete(event.id)}
                />
              ))}
            </View>
          )}

          {events.length === 0 && (
            <ThemedCard variant="outlined" style={styles.emptyCard}>
              <View style={styles.emptyContent}>
                <Text style={styles.emptyTitle}>No events yet</Text>
                <Text style={styles.emptyText}>
                  Seamless will show parsed events here as they appear.
                </Text>
              </View>
            </ThemedCard>
          )}
        </View>
      </ScrollView>

      <FloatingActionButton onPress={handleAddEvent} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  content: {
    flex: 1,
    ...(Platform.OS === 'web' && {
      maxWidth: maxContentWidth,
      width: '100%',
      alignSelf: 'center',
      paddingHorizontal: spacing.lg,
    }),
  },
  section: {
    marginBottom: spacing.xl,
    marginTop: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  countBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  countText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  emptyCard: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing['3xl'],
  },
  emptyContent: {
    padding: spacing['2xl'],
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.fontSize.base * typography.lineHeight.relaxed,
  },
});
