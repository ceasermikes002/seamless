import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle, Image, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography, elevation, radius } from '@/constants/theme';

interface AppBarProps {
  title?: string;
  showLogo?: boolean;
  rightAction?: {
    icon?: React.ReactNode;
    label?: string;
    onPress: () => void;
  };
  style?: ViewStyle;
}

export const AppBar: React.FC<AppBarProps> = ({
  title = 'Seamless',
  showLogo = false,
  rightAction,
  style,
}) => {
  return (
    <SafeAreaView edges={['top']} style={[styles.container, style]}>
      <View style={styles.content}>
        <View style={styles.leftSection}>
          {showLogo && (
            <View style={styles.logoContainer}>
              <Image
                source={require('@/assets/images/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
          )}
          <Text style={styles.title}>{title}</Text>
        </View>
        
        {rightAction && (
          <TouchableOpacity
            style={styles.rightAction}
            onPress={rightAction.onPress}
            activeOpacity={0.7}
          >
            {rightAction.icon}
            {rightAction.label && (
              <Text style={styles.rightActionLabel}>{rightAction.label}</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceHeader,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    ...elevation.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: Platform.OS === 'web' ? 64 : 56,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: 'rgba(201, 201, 201, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  logo: {
    width: 28,
    height: 28,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  rightAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
  },
  rightActionLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.accentSecondary,
    marginLeft: spacing.xs,
  },
});

