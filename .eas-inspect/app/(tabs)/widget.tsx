import { GlassCard } from '@/components/ui/GlassCard';
import { useEvents } from '@/contexts/EventContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Event } from '@/types';
import { StatusBar } from 'expo-status-bar';
import React, { useRef, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: screenWidth } = Dimensions.get('window');

export default function WidgetDemoScreen() {
  const { events } = useEvents();
  const { isDark } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const todayEvents = events.filter(event => {
    const today = new Date();
    const eventDate = new Date(event.date);
    return eventDate.toDateString() === today.toDateString();
  });

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset;
    const index = Math.round(contentOffset.x / (screenWidth - 40));
    setCurrentIndex(index);
  };

  const getCategoryColor = (category: Event['category']) => {
    const colors = {
      delivery: '#3B82F6',
      travel: '#10B981',
      appointment: '#F59E0B',
      ticket: '#EF4444',
      subscription: '#8B5CF6',
    };
    return colors[category] || '#6B7280';
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (todayEvents.length === 0) {
    return (
      <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <View style={styles.header}>
          <Text style={[styles.title, isDark && styles.darkText]}>Today&apos;s Events</Text>
          <Text style={[styles.subtitle, isDark && styles.darkSubtext]}>Widget Demo</Text>
        </View>
        <View style={styles.emptyContainer}>
          <GlassCard style={[styles.emptyCard, isDark && styles.darkEmptyCard]}>
            <View style={styles.emptyContent}>
              <Text style={[styles.emptyTitle, isDark && styles.darkText]}>No events today</Text>
              <Text style={[styles.emptyText, isDark && styles.darkSubtext]}>
                No events for today. It&apos;s a perfect day to relax!
              </Text>
            </View>
          </GlassCard>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, isDark && styles.darkContainer]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <View style={styles.header}>
        <Text style={[styles.title, isDark && styles.darkText]}>Today&apos;s Events</Text>
        <Text style={[styles.subtitle, isDark && styles.darkSubtext]}>
          {todayEvents.length} event{todayEvents.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.carousel}
        contentContainerStyle={styles.carouselContent}
      >
        {todayEvents.map((event, index) => (
          <View key={event.id} style={styles.cardContainer}>
            <GlassCard style={[styles.eventCard, isDark && styles.darkEventCard]}>
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <View style={[styles.categoryIndicator, { backgroundColor: getCategoryColor(event.category) }]} />
                  <Text style={[styles.eventTitle, isDark && styles.darkText]} numberOfLines={2}>
                    {event.title}
                  </Text>
                </View>

                <View style={styles.timeContainer}>
                  <Text style={[styles.timeText, isDark && styles.darkSubtext]}>
                    {formatTime(event.date)}
                  </Text>
                </View>

                {event.location && (
                  <View style={styles.locationContainer}>
                    <Text style={[styles.locationText, isDark && styles.darkSubtext]}>
                      📍 {event.location}
                    </Text>
                  </View>
                )}

                {event.trackingId && (
                  <View style={styles.trackingContainer}>
                    <Text style={[styles.trackingText, isDark && styles.darkSubtext]}>
                      🏷️ {event.trackingId}
                    </Text>
                  </View>
                )}

                <View style={styles.categoryContainer}>
                  <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(event.category) + '20' }]}>
                    <Text style={[styles.categoryText, { color: getCategoryColor(event.category) }]}>
                      {event.category}
                    </Text>
                  </View>
                </View>
              </View>
            </GlassCard>
          </View>
        ))}
      </ScrollView>

      <View style={styles.pagination}>
        {todayEvents.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dot,
              index === currentIndex ? styles.activeDot : styles.inactiveDot,
              isDark && styles.darkDot,
            ]}
            onPress={() => {
              scrollViewRef.current?.scrollTo({
                x: index * (screenWidth - 40),
                animated: true,
              });
            }}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, isDark && styles.darkSubtext]}>
          Swipe to navigate between events
        </Text>
      </View>
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
  carousel: {
    flex: 1,
  },
  carouselContent: {
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  cardContainer: {
    width: screenWidth - 40,
    marginRight: 16,
  },
  eventCard: {
    height: 400,
    marginHorizontal: 0,
  },
  darkEventCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  cardContent: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  categoryIndicator: {
    width: 4,
    height: 60,
    borderRadius: 2,
    marginRight: 16,
    marginTop: 4,
  },
  eventTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
    lineHeight: 32,
  },
  timeContainer: {
    marginTop: 32,
  },
  timeText: {
    fontSize: 48,
    fontWeight: '300',
    color: '#6B7280',
  },
  locationContainer: {
    marginTop: 16,
  },
  locationText: {
    fontSize: 18,
    color: '#6B7280',
  },
  trackingContainer: {
    marginTop: 12,
  },
  trackingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  categoryContainer: {
    marginTop: 32,
  },
  categoryBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#6B46C1',
    width: 24,
  },
  inactiveDot: {
    backgroundColor: '#D1D5DB',
  },
  darkDot: {
    opacity: 0.6,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyCard: {
    width: '100%',
    maxWidth: 320,
  },
  darkEmptyCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  emptyContent: {
    padding: 32,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  darkText: {
    color: '#F9FAFB',
  },
  darkSubtext: {
    color: '#9CA3AF',
  },
});