import { ThemedCard } from '@/components/ui/ThemedCard';
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
import { colors, spacing, typography, radius } from '@/constants/theme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const EmailCard: React.FC<{ email: MockEmail; onPress?: () => void; index?: number }> = ({ 
  email, 
  onPress, 
  index = 0 
}) => {
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
    const categoryColors = {
      delivery: colors.accent,
      travel: colors.accentSecondary,
      appointment: colors.info,
      ticket: colors.warning,
      subscription: colors.accentSecondary,
    };
    return category ? categoryColors[category as keyof typeof categoryColors] || colors.neutral : colors.neutral;
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

  const categoryColor = getCategoryColor(email.category);

  return (
    <Animated.View
      entering={FadeInRight.delay(index * 100).springify()}
      exiting={FadeOutLeft.springify()}
      style={[styles.container, animatedStyle]}
    >
      <ThemedCard
        variant="elevated"
        pressable
        onPress={onPress}
        accentLeft={!email.isProcessed}
        style={styles.card}
      >
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
                { backgroundColor: categoryColor }
              ]}
              entering={FadeInRight.delay(index * 150 + 200).springify()}
            >
              <Text style={styles.avatarText}>
                {getSenderInitials(email.sender)}
              </Text>
            </Animated.View>
            
            <View style={styles.senderInfo}>
              <Text style={styles.sender} numberOfLines={1}>
                {email.sender}
              </Text>
              <Text style={styles.date}>
                {formatDate(email.receivedAt)}
              </Text>
            </View>

            {email.isProcessed && (
              <Animated.View 
                style={[styles.processedBadge, { backgroundColor: colors.success }]}
                entering={FadeInRight.delay(index * 150 + 300).springify()}
              >
                <Text style={styles.processedText}>✓</Text>
              </Animated.View>
            )}
          </View>

          <Text style={styles.subject} numberOfLines={2}>
            {email.subject}
          </Text>
          
          <Text style={styles.preview} numberOfLines={3}>
            {email.content}
          </Text>

          {email.category && (
            <View style={styles.footer}>
              <View style={[styles.categoryBadge, { backgroundColor: categoryColor + '30' }]}>
                <Text style={[styles.categoryText, { color: categoryColor }]}>
                  {email.category}
                </Text>
              </View>
            </View>
          )}
        </AnimatedTouchable>
      </ThemedCard>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  card: {
    overflow: 'hidden',
  },
  content: {
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    color: colors.textOnAccent,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  senderInfo: {
    flex: 1,
  },
  sender: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  date: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  processedBadge: {
    width: 24,
    height: 24,
    borderRadius: radius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  processedText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  subject: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  preview: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: spacing.sm,
  },
  categoryBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
  },
  categoryText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    textTransform: 'capitalize',
  },
});
