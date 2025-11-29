import { GlassCard } from '@/components/ui/GlassCard';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MockEmail } from '@/types';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  FadeInRight,
  FadeOutLeft,
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const EmailCard: React.FC<{ email: MockEmail; onPress?: () => void; index?: number }> = ({ email, onPress, index = 0 }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { scale: scale.value }
    ],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const getSenderInitials = (sender: string) => {
    return sender
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getCategoryColor = (category?: string) => {
    const colors = {
      delivery: '#3B82F6',
      travel: '#10B981',
      appointment: '#F59E0B',
      ticket: '#EF4444',
      subscription: '#8B5CF6',
    };
    return category ? colors[category as keyof typeof colors] || '#6B7280' : '#6B7280';
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <Animated.View
      entering={FadeInRight.delay(index * 100).springify()}
      exiting={FadeOutLeft.springify()}
      style={[styles.container, animatedStyle]}
    >
      <GlassCard pressable style={[styles.card, isDark && styles.darkCard]}>
        <AnimatedTouchable 
          style={styles.content} 
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
        >
          <View style={styles.header}>
            <Animated.View 
              style={[
                styles.avatar, 
                { backgroundColor: getCategoryColor(email.category) }
              ]}
              entering={FadeInRight.delay(index * 150 + 200).springify()}
            >
              <Text style={styles.avatarText}>
                {getSenderInitials(email.sender)}
              </Text>
            </Animated.View>
            
            <View style={styles.senderInfo}>
              <Text style={[styles.sender, isDark && styles.darkText]} numberOfLines={1}>
                {email.sender}
              </Text>
              <Text style={[styles.date, isDark && styles.darkSubtext]}>
                {formatDate(email.receivedAt)}
              </Text>
            </View>

            {email.isProcessed && (
              <Animated.View 
                style={[styles.processedBadge, { backgroundColor: '#10B981' }]}
                entering={FadeInRight.delay(index * 150 + 300).springify()}
              >
                <Text style={[styles.processedText, { color: '#FFFFFF' }]}>✓</Text>
              </Animated.View>
            )}
          </View>

          <Text style={[styles.subject, isDark && styles.darkText]} numberOfLines={2}>
            {email.subject}
          </Text>
          
          <Text style={[styles.preview, isDark && styles.darkSubtext]} numberOfLines={3}>
            {email.content}
          </Text>
        </AnimatedTouchable>
      </GlassCard>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  card: {
    overflow: 'hidden',
  },
  darkCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  senderInfo: {
    flex: 1,
  },
  sender: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  date: {
    fontSize: 14,
    color: '#6B7280',
  },
  processedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  processedText: {
    fontSize: 12,
    fontWeight: '600',
  },
  body: {
    marginBottom: 12,
  },
  subject: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  preview: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  darkText: {
    color: '#F9FAFB',
  },
  darkSubtext: {
    color: '#9CA3AF',
  },
});
