import React from 'react';
import { StyleSheet, View, ViewProps, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { colors, radius, spacing, elevation } from '@/constants/theme';

interface ThemedCardProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  pressable?: boolean;
  onPress?: () => void;
  accentLeft?: boolean;
  style?: ViewStyle;
}

export const ThemedCard: React.FC<ThemedCardProps> = ({
  children,
  variant = 'default',
  pressable = false,
  onPress,
  accentLeft = false,
  style,
  ...props
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    if (pressable) {
      scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
      opacity.value = withTiming(0.9, { duration: 150 });
    }
  };

  const handlePressOut = () => {
    if (pressable) {
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      opacity.value = withTiming(1, { duration: 150 });
    }
  };

  const variantStyles = {
    default: {
      backgroundColor: colors.surface,
      ...elevation.sm,
    },
    elevated: {
      backgroundColor: colors.surfaceElevated,
      ...elevation.md,
    },
    outlined: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      ...elevation.none,
    },
  };

  return (
    <Animated.View
      style={[
        styles.container,
        variantStyles[variant],
        {
          borderRadius: radius.lg,
          padding: spacing.lg,
        },
        animatedStyle,
        style,
      ]}
      onTouchStart={pressable ? handlePressIn : undefined}
      onTouchEnd={pressable ? handlePressOut : undefined}
      onTouchCancel={pressable ? handlePressOut : undefined}
      {...props}
    >
      {accentLeft && <View style={styles.accentLeft} />}
      {pressable && onPress ? (
        <Animated.View style={StyleSheet.absoluteFill} onTouchEnd={onPress} />
      ) : null}
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
  accentLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: colors.accent,
    borderTopLeftRadius: radius.lg,
    borderBottomLeftRadius: radius.lg,
  },
});

