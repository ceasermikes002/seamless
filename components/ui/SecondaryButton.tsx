import React from 'react';
import { StyleSheet, Text, TouchableOpacity, TouchableOpacityProps, ViewStyle, Platform } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { colors, radius, spacing, typography } from '@/constants/theme';

const AnimatedTouchable = Platform.OS === 'web' 
  ? TouchableOpacity 
  : Animated.createAnimatedComponent(TouchableOpacity);

interface SecondaryButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  variant?: 'outline' | 'ghost';
}

export const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  title,
  onPress,
  disabled = false,
  style,
  size = 'md',
  fullWidth = false,
  variant = 'outline',
  ...props
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = Platform.OS === 'web' 
    ? undefined 
    : useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
      }));

  const handlePressIn = () => {
    if (!disabled && Platform.OS !== 'web') {
      scale.value = withSpring(0.96, { damping: 15, stiffness: 400 });
      opacity.value = withSpring(0.8, { damping: 15, stiffness: 400 });
    }
  };

  const handlePressOut = () => {
    if (!disabled && Platform.OS !== 'web') {
      scale.value = withSpring(1, { damping: 15, stiffness: 400 });
      opacity.value = withSpring(1, { damping: 15, stiffness: 400 });
    }
  };

  const sizeStyles = {
    sm: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.lg,
      minHeight: 36,
      fontSize: typography.fontSize.sm,
    },
    md: {
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      minHeight: 44,
      fontSize: typography.fontSize.base,
    },
    lg: {
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing['2xl'],
      minHeight: 52,
      fontSize: typography.fontSize.lg,
    },
  };

  const currentSize = sizeStyles[size];

  const isGhost = variant === 'ghost';

  const staticStyle: ViewStyle = {
    backgroundColor: isGhost
      ? 'transparent'
      : disabled
      ? 'transparent'
      : colors.backgroundAlt,
    borderWidth: isGhost ? 0 : 1,
    borderColor: disabled ? colors.disabled : colors.accent,
    borderRadius: radius.md,
    minHeight: currentSize.minHeight,
    paddingVertical: currentSize.paddingVertical,
    paddingHorizontal: currentSize.paddingHorizontal,
    ...(fullWidth && { width: '100%' }),
  };

  return (
    <AnimatedTouchable
      style={[styles.button, staticStyle, animatedStyle, style].filter(Boolean)}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={0.9}
      {...props}
    >
      <Text
        style={[
          styles.text,
          {
            fontSize: currentSize.fontSize,
            color: disabled
              ? colors.disabled
              : isGhost
              ? colors.accentSecondary
              : colors.accentSecondary,
          },
        ]}
      >
        {title}
      </Text>
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontWeight: typography.fontWeight.semibold,
    textAlign: 'center',
  },
});

