import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Event } from '../types';
import { GlassCard } from './ui/GlassCard';
import { useTheme } from '../contexts/ThemeContext';

interface EventCardProps {
  event: Event;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({ 
  event, 
  onPress, 
  onEdit, 
  onDelete 
}) => {
  const { isDark } = useTheme();

  const getCategoryColor = (category: Event['category']) => {
    const colors = {
      delivery: '#3B82F6', // blue
      travel: '#10B981', // green
      appointment: '#F59E0B', // amber
      ticket: '#EF4444', // red
      subscription: '#8B5CF6', // purple
    };
    return colors[category] || '#6B7280';
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

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      renderLeftActions={renderLeftActions}
      containerStyle={styles.swipeContainer}
    >
      <GlassCard style={[styles.card, isDark && styles.darkCard]}>
        <TouchableOpacity 
          style={styles.content} 
          onPress={onPress}
          activeOpacity={0.7}
        >
          <View style={styles.header}>
            <View style={[styles.categoryIndicator, { backgroundColor: getCategoryColor(event.category) }]} />
            <Text style={[styles.title, isDark && styles.darkText]} numberOfLines={2}>
              {event.title}
            </Text>
          </View>
          
          <View style={styles.details}>
            <Text style={[styles.date, isDark && styles.darkSubtext]}>
              {formatDate(event.date)}
            </Text>
            
            {event.location && (
              <Text style={[styles.location, isDark && styles.darkSubtext]} numberOfLines={1}>
                📍 {event.location}
              </Text>
            )}
            
            {event.trackingId && (
              <Text style={[styles.tracking, isDark && styles.darkSubtext]}>
                🏷️ Tracking: {event.trackingId}
              </Text>
            )}
          </View>

          <View style={styles.footer}>
            <View style={[styles.statusBadge, { backgroundColor: getCategoryColor(event.category) + '20' }]}>
              <Text style={[styles.statusText, { color: getCategoryColor(event.category) }]}>
                {event.category}
              </Text>
            </View>
            <Text style={[styles.statusLabel, isDark && styles.darkSubtext]}>
              {event.status}
            </Text>
          </View>
        </TouchableOpacity>
      </GlassCard>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  swipeContainer: {
    marginBottom: 12,
  },
  card: {
    marginHorizontal: 16,
  },
  darkCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  categoryIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 12,
    marginTop: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    lineHeight: 24,
  },
  darkText: {
    color: '#F9FAFB',
  },
  details: {
    marginBottom: 12,
  },
  date: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  tracking: {
    fontSize: 14,
    color: '#6B7280',
  },
  darkSubtext: {
    color: '#9CA3AF',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  statusLabel: {
    fontSize: 14,
    color: '#6B7280',
    textTransform: 'capitalize',
  },
  rightActions: {
    flexDirection: 'row',
    marginLeft: -8,
  },
  leftActions: {
    flexDirection: 'row',
    marginRight: -8,
  },
  actionButton: {
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    borderRadius: 16,
  },
  editButton: {
    backgroundColor: '#10B981',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
  },
  statusButton: {
    backgroundColor: '#6B7280',
  },
  actionText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});