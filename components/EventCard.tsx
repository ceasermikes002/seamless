import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';
import { Event } from '../types';
import { ThemedCard } from './ui/ThemedCard';
import { colors, spacing, typography, radius } from '@/constants/theme';

interface EventCardProps {
  event: Event;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  index?: number;
}

export const EventCard: React.FC<EventCardProps> = ({ 
  event, 
  onPress, 
  onEdit, 
  onDelete,
  index = 0
}) => {
  const getCategoryColor = (category: Event['category']) => {
    // Use accent colors for categories, with golden as primary
    const categoryColors = {
      delivery: colors.accent,           // Golden for deliveries
      travel: colors.accentSecondary,     // Light sand for travel
      appointment: colors.info,           // Blue for appointments
      ticket: colors.warning,            // Amber for tickets
      subscription: colors.accentSecondary, // Sand for subscriptions
    };
    return categoryColors[category] || colors.neutral;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderRightActions = () => (
    <View style={styles.rightActions}>
      <TouchableOpacity 
        style={[styles.actionButton, styles.editButton]} 
        onPress={onEdit}
      >
        <Text style={styles.actionText}>Edit</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={[styles.actionButton, styles.deleteButton]} 
        onPress={onDelete}
      >
        <Text style={styles.actionText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLeftActions = () => (
    <View style={styles.leftActions}>
      <TouchableOpacity 
        style={[styles.actionButton, styles.statusButton]} 
        onPress={() => {}}
      >
        <Text style={styles.actionText}>
          {event.status === 'approved' ? '✓' : event.status === 'rejected' ? '✗' : '?'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const categoryColor = getCategoryColor(event.category);
  const isImportant = event.status === 'approved' || event.category === 'delivery';

  return (
    <Animated.View
      entering={FadeInRight.delay(index * 50).springify()}
      exiting={FadeOutLeft.springify()}
      style={styles.swipeContainer}
    >
      <Swipeable
        renderRightActions={renderRightActions}
        renderLeftActions={renderLeftActions}
        containerStyle={styles.swipeContainer}
      >
        <ThemedCard
          variant="elevated"
          pressable
          onPress={onPress}
          accentLeft={isImportant}
          style={styles.card}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={[styles.categoryIndicator, { backgroundColor: categoryColor }]} />
              <View style={styles.titleContainer}>
                <Text style={styles.title} numberOfLines={2}>
                  {event.title}
                </Text>
              </View>
            </View>
            
            <View style={styles.details}>
              <Text style={styles.date}>
                {formatDate(event.date)}
              </Text>
              
              {event.location && (
                <Text style={styles.location} numberOfLines={1}>
                  📍 {event.location}
                </Text>
              )}
              
              {event.trackingId && (
                <Text style={styles.tracking}>
                  🏷️ Tracking: {event.trackingId}
                </Text>
              )}
            </View>

            <View style={styles.footer}>
              <View style={[styles.statusBadge, { backgroundColor: categoryColor + '40' }]}>
                <Text style={[styles.statusText, { 
                  color: categoryColor,
                  fontWeight: typography.fontWeight.bold,
                }]}>
                  {event.category}
                </Text>
              </View>
              <View style={[styles.statusDot, { backgroundColor: 
                event.status === 'approved' ? colors.success : 
                event.status === 'rejected' ? colors.error : 
                colors.neutral 
              }]} />
              <Text style={styles.statusLabel}>
                {event.status}
              </Text>
            </View>
          </View>
        </ThemedCard>
      </Swipeable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  swipeContainer: {
    marginBottom: spacing.md,
  },
  card: {
    marginHorizontal: spacing.lg,
  },
  content: {
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  categoryIndicator: {
    width: 4,
    height: 40,
    borderRadius: radius.sm,
    marginRight: spacing.md,
    marginTop: 4,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    flex: 1,
    lineHeight: typography.fontSize.lg * typography.lineHeight.normal,
  },
  details: {
    marginBottom: spacing.md,
  },
  date: {
    fontSize: typography.fontSize.base,
    color: colors.accentSecondary,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.xs,
  },
  location: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  tracking: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    textTransform: 'capitalize',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: spacing.sm,
  },
  statusLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
    textTransform: 'capitalize',
    marginLeft: 'auto',
  },
  rightActions: {
    flexDirection: 'row',
    marginLeft: -spacing.sm,
    alignItems: 'center',
  },
  leftActions: {
    flexDirection: 'row',
    marginRight: -spacing.sm,
    alignItems: 'center',
  },
  actionButton: {
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: spacing.xs,
    borderRadius: radius.lg,
    minHeight: 44,
  },
  editButton: {
    backgroundColor: colors.success,
  },
  deleteButton: {
    backgroundColor: colors.error,
  },
  statusButton: {
    backgroundColor: colors.neutral,
  },
  actionText: {
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.semibold,
    fontSize: typography.fontSize.sm,
  },
});
